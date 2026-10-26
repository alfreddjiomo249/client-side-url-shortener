export default class UrlView {
    #form;
    #urlInput;
    #copyButton;
    #pasteButton;
    #shortenButton;
    #shortUrlOutput;
    #message = document.querySelector("p");
    #dialog = document.querySelector("dialog");

    constructor() {
        this.#bindShowMessage();
        if (!this.isHomePage()) return;
        this.#form = document.querySelector("form[name=main]");
        this.#urlInput = document.querySelector("input");
        this.#copyButton = document.querySelector("button.copy");
        this.#pasteButton = document.querySelector("button.paste");
        this.#shortenButton = document.querySelector("button[type=submit]");
        this.#shortUrlOutput = document.querySelector("output");
        this.#bindCopy();
        this.#bindReset();
    }

    get #url() {
        return this.#urlInput.value.trim();
    }

    set #url(inputUrl) {
        this.#urlInput.value = inputUrl.trim();
    }

    get #shortUrl() {
        return this.#shortUrlOutput.textContent.trim();
    }

    set #shortUrl(outputUrl) {
        this.#shortUrlOutput.textContent = outputUrl.trim();
    }

    get ERR_INVALID_URL() {
        return "Please enter a valid URL.";
    }

    get ERR_INVALID_URL_CODE() {
        return 0x1;
    }

    get ERR_INVALID_URL_PROTOCOL() {
        return "Only HTTP and HTTPS are supported.";
    }

    get ERR_INVALID_URL_PROTOCOL_CODE() {
        return 0x2;
    }

    bindShorten(shorten) {
        this.#form.addEventListener("submit", event => {
            event.preventDefault();
            this.#showMessage("");
            this.#clearShortUrl();
            shorten(this.#url);
            this.#showMessage("URL shortened successfully.");
        });
    }

    bindPaste(validate) {
        this.#pasteButton.addEventListener("click", async () => {
            try {
                const candidateUrl = (await navigator.clipboard.readText()).trim();
                validate(candidateUrl);
                this.#url = candidateUrl;
                this.#focusInput();
                this.#enableShortenButton();
                this.#closeDialog();
            } catch ({ cause, message }) {
                switch (cause) {
                    case this.ERR_INVALID_URL_CODE:
                        this.#showMessage("Please paste a valid URL.", true)
                        break;
                    case this.ERR_INVALID_URL_PROTOCOL_CODE:
                        this.#showMessage(`Paste failed. ${message}`, true)
                        break;
                    default:
                        this.#showMessage(message, true);
                }
            }
        });
    }

    bindUrlChanged(validate) {
        this.#urlInput.addEventListener("input", () => {
            this.#clearShortUrl();
            try {
                validate(this.#url);
                this.#enableShortenButton();
                this.#closeDialog()
            } catch {
                this.#disableShortenButton();
                if (this.#url.length === 0) this.#form.reset();
            }
        });
    }

    redirect(url) {
        if (url) return window.location.replace(url);
        this.#showMessage("This short URL was not found in this browser's storage.", true);
    }

    showShortUrl(url) {
        this.#shortUrl = url;
    }

    isHomePage() {
        return ["/", "/index.html"].includes(window.location.pathname);
    }

    #bindCopy() {
        this.#copyButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(this.#shortUrl);
                this.#showMessage("Short URL copied to clipboard.");
            } catch {
                this.#showMessage("Copy failed. Please copy the URL manually.", true);
            }
        });
    }

    #bindShowMessage() {
        window.addEventListener("error", event => this.#showMessage(event.error.message, true));
    }

    #bindReset() {
        this.#form.addEventListener("reset", () => {
            this.#closeDialog();
            this.#clearShortUrl();
            this.#focusInput();
            this.#disableShortenButton();
        });
    }

    #clearShortUrl() {
        this.#shortUrl = "";
    }

    #showMessage(message, isError = false) {
        this.#dialog.show();
        const msg = this.#message;
        msg.classList.toggle("error", isError);
        msg.textContent = message;
        const sm = this.#showMessage;
        clearTimeout(sm.timeoutId);
        sm.timeoutId = setTimeout(this.#closeDialog.bind(this), 10000);
    }

    #focusInput() {
        this.#urlInput.focus();
    }

    #disableShortenButton() {
        this.#shortenButton.disabled = true;
    }

    #enableShortenButton() {
        this.#shortenButton.disabled = false;
    }

    #closeDialog() {
        this.#dialog.close();
    }
}