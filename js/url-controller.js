export class UrlController {
    #model;
    #view;

    constructor(model, view) {
        this.#model = model;
        this.#view = view;
    }

    init() {
        if (this.#view.isIndex()) {
            this.#view.bindShorten(this.shorten.bind(this));
            this.#view.bindCopy(this.copy.bind(this));
            this.#view.bindPaste(this.paste.bind(this));
            this.#view.bindReset(this.reset.bind(this));
            this.#view.bindUrlChanged(this.urlChanged.bind(this));
        }
        
        this.#view.bindShowErrorStatus();
        this.resolveShortUrl();
    }

    shorten(url) {
        this.#view.clearMessage();
        this.#view.clearShortUrl();

        const baseUrl = new URL(window.location.href);

        baseUrl.hash = "";
        baseUrl.search = "";

        const shortUrl = this.#model.createShortUrl(
            url,
            baseUrl.href
        );

        this.#view.showShortUrl(shortUrl);
        this.#view.showMessage("URL shortened successfully.");
    }

    async copy(url) {
        try {
            await navigator.clipboard.writeText(url);
            this.#view.showMessage("Short URL copied to clipboard.");
        } catch {
            this.#view.showMessage("Copy failed. Please copy the URL manually.", true);
        }
    }

    async paste() {
        try {
            const candidateUrl = (await navigator.clipboard.readText()).trim();
            this.#model.validateUrl(candidateUrl);
            return candidateUrl;
        } catch (error) {
            this.#view.dispatchErrorEvent(error.message);
        }
    }

    async reset() {
        this.#view.clearShortUrl();
        this.#view.focusInput();
        this.#view.disableShortenButton();
    }

    urlChanged(url) {
        try {
            this.#model.validateUrl(url);
            this.#view.enableShortenButton();
            this.#view.closeDialog()
        } catch {
            this.#view.disableShortenButton();
        }
    }

    resolveShortUrl() {
        const id = window.location.pathname.substring(1);

        if (!id) {
            return;
        }

        const originalUrl = this.#model.findById(id);

        if (originalUrl)
            window.location.replace(originalUrl);
        else
            throw new Error("This short URL was not found in this browser's storage.");
    }
}
