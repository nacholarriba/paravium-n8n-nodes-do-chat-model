import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DigitalOceanInferenceApi implements ICredentialType {
	name = 'digitalOceanInferenceApi';

	displayName = 'DigitalOcean Inference API';

	documentationUrl =
		'https://docs.digitalocean.com/products/inference/how-to/model-access-keys/';

	properties: INodeProperties[] = [
		{
			displayName: 'Model Access Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Create one at DigitalOcean Cloud → Agent Platform → Serverless Inference → Model Access Keys. A DigitalOcean personal access token (dop_v1_…) also works.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://inference.do-ai.run/v1',
			description:
				'Override only if you have a custom or dedicated inference endpoint. Default is the public Gradient Serverless Inference endpoint.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/models',
			method: 'GET',
		},
	};
}
