import type { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from 'dotenv';

dotenv.config();
const graphqlPath = './src/lib/graphql/';

const config: CodegenConfig = {
	schema: process.env.GRAPHQL_ENDPOINT,
	documents: './src/**/*.graphql',
	generates: {
		[`${graphqlPath}types.ts`]: {
			plugins: ['typescript', 'typescript-operations']
		},
		[`${graphqlPath}/schema.graphql`]: {
			plugins: ['schema-ast']
		}
	}
};
export default config;
