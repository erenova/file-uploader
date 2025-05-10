class LoadingManager {
  constructor(minDuration = 400) {
    this.minDuration = minDuration;
    this.loadingElement = null;
    this.startTime = null;
    this.showTimeout = null;
    this.isShowing = false;
    this.cancelled = false; // ✅ ADD THIS
    this.currentMessage = "";
  }

  async show(message = "") {
    if (this.isShowing) {
      if (message && message !== this.currentMessage) {
        const messageEl = document.getElementById("loading-message");
        if (messageEl) {
          messageEl.textContent = message;
          this.currentMessage = message;
        }
      }
      return;
    }

    this.isShowing = true;
    this.cancelled = false; // ✅ RESET CANCEL STATE
    this.currentMessage = message;

    return new Promise((resolve) => {
      this.showTimeout = setTimeout(() => {
        // ✅ CHECK IF HIDE CALLED BEFORE TIMEOUT
        if (this.cancelled) {
          this.isShowing = false;
          this.showTimeout = null;
          return;
        }

        const template = `
  <div id="loading-overlay" class="w-full h-full bg-gray-400 opacity-0 fixed top-0 left-0 z-[9999] transition-all duration-300"></div>
  <div id="loading-spinner" class="fixed inset-0 z-[10000] flex items-center justify-center opacity-0 scale-95 transition-all duration-300">
    <div class="flex flex-col items-center">
      <img src="/img/senseiLoading.png" alt="Loading..." class="w-20 animate-spin" style="animation-duration: 1.2s;" />
      ${
        message
          ? `<p id="loading-message" class="mt-4 text-gray-800 font-medium text-center">${message}</p>`
          : ""
      }
    </div>
  </div>
`;

        const div = document.createElement("div");
        div.id = "loading-container";
        div.innerHTML = template;
        document.body.appendChild(div);

        void document.getElementById("loading-overlay").offsetHeight;

        requestAnimationFrame(() => {
          const overlay = document.getElementById("loading-overlay");
          const spinner = document.getElementById("loading-spinner");
          overlay.classList.add("opacity-75");
          spinner.classList.add("opacity-100", "scale-100");
          resolve();
        });

        this.loadingElement = div;
        this.startTime = Date.now();
        this.showTimeout = null;
      }, 100);
    });
  }

  async hide() {
    if (!this.isShowing) return;

    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.cancelled = true; // ✅ MARK AS CANCELLED
      this.showTimeout = null;
      this.isShowing = false;
      return;
    }

    if (!this.loadingElement || !this.startTime) {
      this.isShowing = false;
      return;
    }

    const elapsedTime = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.minDuration - elapsedTime);

    if (remainingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, remainingTime));
    }

    const overlay = document.getElementById("loading-overlay");
    const spinner = document.getElementById("loading-spinner");

    if (overlay && spinner) {
      overlay.classList.remove("opacity-75");
      spinner.classList.remove("opacity-100", "scale-100");
      spinner.classList.add("scale-95");

      await new Promise((resolve) => setTimeout(resolve, 300));
      if (this.loadingElement) {
        this.loadingElement.remove();
      }
    }

    this.loadingElement = null;
    this.startTime = null;
    this.isShowing = false;
    this.cancelled = false; // ✅ reset for next usage
    this.currentMessage = "";
  }
}

// Global instance
window.loadingManager = new LoadingManager(400);
