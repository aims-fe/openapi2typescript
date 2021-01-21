/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import type { OperationObject } from 'openapi3-ts';
import fetch from 'node-fetch';
import ServiceGenerator from './serviceGenerator';

const getImportStatement = (requestLibPath: string) => {
  if (requestLibPath && requestLibPath.startsWith('import')) {
    return requestLibPath;
  }
  if (requestLibPath) {
    return `import request from '${requestLibPath}'`;
  }
  return `import { request } from "umi"`;
};

export type GenerateServiceProps = {
  requestLibPath?: string;
  requestImportStatement?: string;
  /**
   * api 的前缀
   */
  apiPrefix?:
    | string
    | ((params: {
        path: string;
        method: string;
        namespace: string;
        functionName: string;
        autoExclude?: boolean;
      }) => string);
  /**
   * 生成的文件夹的路径
   */
  serversPath?: string;
  /**
   * openAPI 3.0 的地址
   */
  schemaPath?: string;
  /**
   * 项目名称
   */
  projectName?: string;

  hook?: {
    /** 自定义函数名称 */
    customFunctionName?: (data: OperationObject) => string;
    /** 自定义类名 */
    customClassName?: (tagName: string) => string;
  };
  namespace?: string;
};

const getSchema = async (schemaPath: string) => {
  if (schemaPath.startsWith('http')) {
    const json = await fetch(schemaPath).then((rest) => rest.json());
    return json;
  }
  const schema = require(schemaPath);
  return schema;
};

// 从 appName 生成 service 数据
export const generateService = async ({
  requestLibPath,
  schemaPath,
  ...rest
}: GenerateServiceProps) => {
  const schema = await getSchema(schemaPath);
  if (!schema) {
    return;
  }
  const requestImportStatement = getImportStatement(requestLibPath);
  const serviceGenerator = new ServiceGenerator(
    {
      namespace: 'API',
      requestImportStatement,
      ...rest,
    },
    schema,
  );
  serviceGenerator.genFile();

  process.exit();
};
