interface PSEWindow extends Window {
  __gcse?: any;
  google?: any;
}

declare const window: PSEWindow;

let pseLoaded = false;
let pseReady = false;
let currentCx = '';
let loadingPromise: Promise<void> | null = null;

export async function loadPSE(cx: string): Promise<void> {
  if (pseLoaded && currentCx === cx && pseReady) return;
  
  // If already loading the same CX, return the existing promise
  if (loadingPromise && currentCx === cx) {
    return loadingPromise;
  }
  
  // If CX changed, we need to reload
  if (pseLoaded && currentCx !== cx) {
    // Remove existing script
    const existingScript = document.querySelector('script[src*="cse.google.com"]');
    if (existingScript) {
      existingScript.remove();
    }
    pseLoaded = false;
    pseReady = false;
  }
  
  currentCx = cx;
  
  loadingPromise = new Promise((resolve, reject) => {
    // Set parse tags to explicit before loading
    window.__gcse = {
      parsetags: 'explicit',
      callback: () => {
        pseReady = true;
        loadingPromise = null;
        resolve();
      }
    };

    const script = document.createElement('script');
    script.src = `https://cse.google.com/cse.js?cx=${cx}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      pseLoaded = true;
      // If callback wasn't called, fallback to timeout
      if (!pseReady) {
        setTimeout(() => {
          pseReady = true;
          loadingPromise = null;
          resolve();
        }, 1000);
      }
    };
    
    script.onerror = () => {
      pseLoaded = false;
      pseReady = false;
      currentCx = '';
      loadingPromise = null;
      reject(new Error('Failed to load Google CSE'));
    };
    
    // Add script to head
    document.head.appendChild(script);
  });
  
  return loadingPromise;
}

export function execute(query: string, containerId: string = 'results-only'): void {
  if (!pseReady || !window.google?.search?.cse) {
    return;
  }

  try {
    const element = document.getElementById(containerId);
    if (!element) {
      return;
    }

    // Clear previous results
    element.innerHTML = '';
    
    // Generate unique gname for this container
    const gname = `cse-${containerId}-${Date.now()}`;
    
    // Render new CSE element
    window.google.search.cse.element.render({
      div: containerId,
      tag: 'searchresults-only',
      gname: gname,
      attributes: {
        queryParameterName: 'q',
        linkTarget: '_parent',
        noResultsString: 'No results found',
        enableAutoComplete: true,
        resultsUrl: window.location.origin,
        newWindow: false
      }
    });
    
    // Wait a moment for rendering then execute
    setTimeout(() => {
      const cseElement = window.google.search.cse.element.getElement(gname);
      if (cseElement && cseElement.execute) {
        cseElement.execute(query);
      } else {
        // Fallback: try direct search
        window.google.search.cse.element.go(gname);
      }
    }, 100);
    
  } catch (error) {
    console.error('Search execution failed:', error);
  }
}

export function getElement(id: string): HTMLElement | null {
  return document.getElementById(id);
}

export function isPSEReady(): boolean {
  return pseReady;
}