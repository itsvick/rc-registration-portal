import { AppConfig } from "./app.config";
export function configurationFactory(
  config: AppConfig,
  configDeps: (() => Function)[]
): () => Promise<any> {
  return (): Promise<any> => {
    return config.load()
      .then(() => Promise.all(configDeps.map(dep => dep())))
      .then(() => true)
      .catch(error => { throw error; });
  };
}
