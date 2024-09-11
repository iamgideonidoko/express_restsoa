import { Response as ExResponse, Request as ExRequest } from 'express';
import swaggerUi, { type SwaggerUiOptions } from 'swagger-ui-express';
import type { Application } from 'express';

export const GenerateDocs = (app: Application) => {
  app.use('/docs', swaggerUi.serve, async (_: ExRequest, res: ExResponse) => {
    return res.send(
      swaggerUi.generateHTML(await import('../../build/swagger.json'), {
        customCss: '.swagger-ui .topbar { display: none }',
        // ! Remove ugly schemas from docs
        customJsStr: `
setTimeout(() => {
const modelContainers = document.querySelectorAll('.model-container');
modelContainers.forEach((container) => container.textContent.match(/Pick_|Omit_/) && container.remove());
}, 600);
`,
        swaggerOptions: {
          withCredentials: true,
          persistAuthorization: true,
        },
        customSiteTitle: 'ExpressResTSOA Core API Docs',
      } as SwaggerUiOptions),
    );
  });
};
