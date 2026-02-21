import katex from "katex";

function renderMathNode(
  element: HTMLElement,
  source: string,
  displayMode: boolean
) {
  const expression = source.trim();
  if (!expression) return;

  try {
    katex.render(expression, element, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      trust: false,
    });
  } catch {
    element.textContent = displayMode ? `$$${expression}$$` : `$${expression}$`;
  }
}

export function renderMathInContainer(container: ParentNode | null | undefined) {
  if (!container) return;

  if (container instanceof HTMLElement) {
    if (container.hasAttribute("data-math-inline")) {
      const source = container.getAttribute("data-math-inline");
      if (source) renderMathNode(container, source, false);
    }
    if (container.hasAttribute("data-math-block")) {
      const source = container.getAttribute("data-math-block");
      if (source) renderMathNode(container, source, true);
    }
  }

  const inlineNodes = container.querySelectorAll<HTMLElement>("[data-math-inline]");
  inlineNodes.forEach((node) => {
    const source = node.getAttribute("data-math-inline");
    if (!source) return;
    renderMathNode(node, source, false);
  });

  const blockNodes = container.querySelectorAll<HTMLElement>("[data-math-block]");
  blockNodes.forEach((node) => {
    const source = node.getAttribute("data-math-block");
    if (!source) return;
    renderMathNode(node, source, true);
  });
}
