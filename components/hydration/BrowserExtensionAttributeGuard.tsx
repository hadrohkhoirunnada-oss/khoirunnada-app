const EXTENSION_ATTRIBUTE_GUARD = String.raw`
(() => {
  const attributes = ['bis_skin_checked', 'bis_register'];

  const removeInjectedAttributes = (element) => {
    for (const attribute of attributes) {
      if (element.hasAttribute(attribute)) {
        element.removeAttribute(attribute);
      }
    }
  };

  removeInjectedAttributes(document.documentElement);
  document
    .querySelectorAll('[bis_skin_checked], [bis_register]')
    .forEach(removeInjectedAttributes);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        removeInjectedAttributes(mutation.target);
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: attributes,
    subtree: true,
  });

  window.addEventListener('load', () => {
    window.setTimeout(() => observer.disconnect(), 1000);
  }, { once: true });
})();
`;

/**
 * Some security extensions add `bis_*` attributes before React hydrates.
 * Running this guard while the document is parsed keeps the server DOM intact
 * until hydration has completed. It intentionally targets only known external
 * attributes so genuine application hydration errors stay visible.
 */
export function BrowserExtensionAttributeGuard() {
  return (
    <script
      id="browser-extension-attribute-guard"
      dangerouslySetInnerHTML={{ __html: EXTENSION_ATTRIBUTE_GUARD }}
    />
  );
}
