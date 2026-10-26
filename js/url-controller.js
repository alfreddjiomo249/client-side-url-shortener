import UrlModel from "./url-model.js";
import UrlView from "./url-view.js";

export default class UrlController {
    #model = new UrlModel;
    #view = new UrlView;

    init() {
        const view = this.#view;

        if (!view.isHomePage()) return this.#resolveShortUrl();

        view.bindShorten(this.#shortenUrl.bind(this));
        const validate = this.#validateUrl.bind(this);
        view.bindPaste(validate);
        view.bindUrlChanged(validate);
    }

    #shortenUrl(url) {
        this.#view.showShortUrl(this.#model.createShortUrl(
            this.#validateUrl(url),
            Object.assign(new URL(window.location.href), {
                hash: "",
                search: ""
            }).href
        ));
    }

    #validateUrl(candidateUrl) {
        let url;

        try {
            url = new URL(candidateUrl);
        } catch {
            throw new Error(this.#view.ERR_INVALID_URL, {
                cause: this.#view.ERR_INVALID_URL_CODE
            });
        }

        if (["http:", "https:"].includes(url.protocol)) return url.href;
        
        throw new Error(this.#view.ERR_INVALID_URL_PROTOCOL, {
            cause: this.#view.ERR_INVALID_URL_PROTOCOL_CODE
        });
    }

    #resolveShortUrl() {
        this.#view.redirect(this.#model.findById(window.location.pathname.substring(1)));
    }
}