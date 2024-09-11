import { Container, decorate, injectable, interfaces } from 'inversify';
import { buildProviderModule, fluentProvide } from 'inversify-binding-decorators';
import { Controller } from 'tsoa';

export const container = new Container({
  autoBindInjectable: true,
});

export const iocContainer = container;

decorate(injectable(), Controller); // ! Makes tsoa's Controller injectable

// ! Make inversify aware of inversify-binding-decorators
container.load(buildProviderModule());

export const provideSingleton = function <T>(identifier: interfaces.ServiceIdentifier<T>) {
  return fluentProvide(identifier).inSingletonScope().done();
};
