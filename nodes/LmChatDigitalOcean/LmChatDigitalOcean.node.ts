import { ChatOpenAI, type ClientOptions } from '@langchain/openai';
import {
	NodeConnectionTypes,
	type IDataObject,
	type ILoadOptionsFunctions,
	type INodeListSearchResult,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

/**
 * Curated fallback list — used when /v1/models cannot be reached (e.g. before the
 * credential is validated, or when the user is offline). The dropdown in the n8n
 * UI is populated dynamically by `searchModels()` whenever possible.
 *
 * Source of model IDs:
 * https://docs.digitalocean.com/products/inference/details/models/
 */
const FALLBACK_MODELS: string[] = [
	// Anthropic
	'anthropic-claude-opus-4.7',
	'anthropic-claude-opus-4.6',
	'anthropic-claude-4.6-sonnet',
	'anthropic-claude-4.5-sonnet',
	'anthropic-claude-haiku-4.5',
	// OpenAI
	'openai-gpt-5',
	'openai-gpt-5-mini',
	'openai-gpt-5-nano',
	'openai-gpt-4o',
	'openai-gpt-4o-mini',
	'openai-gpt-4.1',
	// Open-source / DO-hosted
	'llama3.3-70b-instruct',
	'llama-4-maverick',
	'deepseek-v4-pro',
	'deepseek-3.2',
	'kimi-k2.6',
	'kimi-k2.5',
	'glm-5',
	'gemma-4-31B-it',
	'alibaba-qwen3-32b',
	'qwen3.5-397b-a17b',
	'mistral-3-14B',
	'openai-gpt-oss-120b',
	'openai-gpt-oss-20b',
];

export class LmChatDigitalOcean implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DigitalOcean Chat Model',
		name: 'lmChatDigitalOcean',
		icon: 'file:paravium.png',
		group: ['transform'],
		version: 1,
		description:
			'Language model served by DigitalOcean Gradient Serverless Inference. Use as the Chat Model for an AI Agent.',
		defaults: {
			name: 'DigitalOcean Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://docs.digitalocean.com/products/inference/',
					},
				],
			},
		},
		credentials: [
			{
				name: 'digitalOceanInferenceApi',
				required: true,
			},
		],
		// No main input/output: this is a sub-node that only supplies a Language Model.
		inputs: [],
		outputs: [NodeConnectionTypes.AiLanguageModel],
		outputNames: ['Model'],
		properties: [
			{
				displayName:
					'You will find the full model catalogue at <a href="https://docs.digitalocean.com/products/inference/details/models/" target="_blank">DigitalOcean → Available Models</a>. Make sure the model you pick supports <b>Agents</b> if you plan to use tool calling.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'resourceLocator',
				default: { mode: 'list', value: 'anthropic-claude-haiku-4.5' },
				required: true,
				modes: [
					{
						displayName: 'From List',
						name: 'list',
						type: 'list',
						typeOptions: {
							searchListMethod: 'searchModels',
							searchable: true,
						},
					},
					{
						displayName: 'By ID',
						name: 'id',
						type: 'string',
						placeholder: 'e.g. anthropic-claude-4.6-sonnet',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 2 },
						default: 0.7,
						description:
							'Controls randomness. 0 = deterministic, 2 = very random. DigitalOcean accepts 0–1 reliably; values above 1 may be clamped depending on the underlying provider.',
					},
					{
						displayName: 'Max Completion Tokens',
						name: 'maxTokens',
						type: 'number',
						default: -1,
						typeOptions: { minValue: -1 },
						description:
							'Maximum tokens to generate. Set to -1 for the model default (~2048 for most providers, mandatory for Anthropic models to get full responses).',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
						default: 1,
					},
					{
						displayName: 'Presence Penalty',
						name: 'presencePenalty',
						type: 'number',
						typeOptions: { minValue: -2, maxValue: 2, numberPrecision: 2 },
						default: 0,
					},
					{
						displayName: 'Frequency Penalty',
						name: 'frequencyPenalty',
						type: 'number',
						typeOptions: { minValue: -2, maxValue: 2, numberPrecision: 2 },
						default: 0,
					},
					{
						displayName: 'Response Format',
						name: 'responseFormat',
						type: 'options',
						options: [
							{ name: 'Text', value: 'text' },
							{ name: 'JSON Object', value: 'json_object' },
						],
						default: 'text',
						description:
							'Force the model to return valid JSON. Make sure your prompt asks for JSON when using "JSON Object".',
					},
					{
						displayName: 'Timeout (ms)',
						name: 'timeout',
						type: 'number',
						default: 60000,
						typeOptions: { minValue: 1000 },
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						type: 'number',
						default: 2,
						typeOptions: { minValue: 0, maxValue: 10 },
					},
				],
			},
		],
	};

	methods = {
		listSearch: {
			async searchModels(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('digitalOceanInferenceApi');
				const apiKey = credentials.apiKey as string;
				const baseUrl = (
					(credentials.baseUrl as string) || 'https://inference.do-ai.run/v1'
				).replace(/\/+$/, '');

				let modelIds: string[] = [];

				try {
					const response = (await this.helpers.httpRequest({
						method: 'GET',
						url: `${baseUrl}/models`,
						headers: {
							Authorization: `Bearer ${apiKey}`,
						},
						json: true,
					})) as { data?: Array<{ id: string }> };

					modelIds = (response.data ?? []).map((m) => m.id).filter(Boolean);
				} catch {
					// Network or auth error — fall back to the curated list so the dropdown
					// is never empty during initial setup.
					modelIds = [...FALLBACK_MODELS];
				}

				if (modelIds.length === 0) {
					modelIds = [...FALLBACK_MODELS];
				}

				const needle = filter?.toLowerCase() ?? '';
				const results = modelIds
					.filter((id) => (needle ? id.toLowerCase().includes(needle) : true))
					.sort()
					.map((id) => ({ name: id, value: id }));

				return { results };
			},
		},
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials('digitalOceanInferenceApi');
		const apiKey = credentials.apiKey as string;
		const baseUrl = (
			(credentials.baseUrl as string) || 'https://inference.do-ai.run/v1'
		).replace(/\/+$/, '');

		const modelLocator = this.getNodeParameter('model', itemIndex) as {
			mode: string;
			value: string;
		};
		const modelName = modelLocator.value;

		const options = this.getNodeParameter('options', itemIndex, {}) as {
			temperature?: number;
			maxTokens?: number;
			topP?: number;
			presencePenalty?: number;
			frequencyPenalty?: number;
			responseFormat?: 'text' | 'json_object';
			timeout?: number;
			maxRetries?: number;
		};

		const clientConfig: ClientOptions = {
			baseURL: baseUrl,
		};

		const modelKwargs: IDataObject = {};
		if (options.responseFormat && options.responseFormat !== 'text') {
			modelKwargs.response_format = { type: options.responseFormat };
		}

		const model = new ChatOpenAI({
			openAIApiKey: apiKey,
			modelName,
			temperature: options.temperature ?? 0.7,
			maxTokens:
				options.maxTokens !== undefined && options.maxTokens > 0
					? options.maxTokens
					: undefined,
			topP: options.topP ?? 1,
			presencePenalty: options.presencePenalty ?? 0,
			frequencyPenalty: options.frequencyPenalty ?? 0,
			timeout: options.timeout ?? 60000,
			maxRetries: options.maxRetries ?? 2,
			configuration: clientConfig,
			modelKwargs: Object.keys(modelKwargs).length ? modelKwargs : undefined,
		});

		return { response: model };
	}
}
