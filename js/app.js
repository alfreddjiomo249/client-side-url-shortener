import { UrlModel } from "./url-model.js";
import { UrlView } from "./url-view.js";
import { UrlController } from "./url-controller.js";

const model = new UrlModel();
const view = new UrlView();
const controller = new UrlController(model, view);

controller.init();
