/**
 * XML Formatting and Validation logic using native DOMParser.
 */

export type XmlIndentSize = 2 | 4 | 'tab';

/**
 * Validates if an XML string is well-formed.
 * Returns null if valid, or an error string with details if invalid.
 */
export function validateXml(xml: string): string | null {
  if (!xml.trim()) return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const errors = doc.getElementsByTagName('parsererror');
    if (errors.length > 0) {
      return errors[0].textContent || 'Invalid XML structure';
    }
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

/**
 * Formats an XML document into a clean, indented string.
 * Throws an error if the XML is malformed.
 */
export function formatXml(xml: string, indent: XmlIndentSize = 2): string {
  if (!xml.trim()) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const errors = doc.getElementsByTagName('parsererror');
  if (errors.length > 0) {
    throw new Error(errors[0].textContent || 'Invalid XML structure');
  }

  const indentStr = indent === 'tab' ? '\t' : ' '.repeat(indent);
  let result = '';

  // Extract original XML declaration if it exists
  const decMatch = xml.match(/^\s*(<\?xml[^>]*\?>)/i);
  if (decMatch) {
    result += decMatch[1].trim() + '\n';
  }

  function serialize(node: Node, depth: number) {
    const spacing = indentStr.repeat(depth);

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      result += `${spacing}<${el.tagName}`;

      // Serialize attributes
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        result += ` ${attr.name}="${attr.value}"`;
      }

      if (el.childNodes.length === 0) {
        result += ' />\n';
      } else {
        // Check if there is only text content (ignoring empty whitespaces)
        const nonWhitespaceChildren = Array.from(el.childNodes).filter(
          (child) => !(child.nodeType === Node.TEXT_NODE && !child.nodeValue?.trim())
        );

        if (nonWhitespaceChildren.length === 1 && nonWhitespaceChildren[0].nodeType === Node.TEXT_NODE) {
          const textVal = nonWhitespaceChildren[0].nodeValue?.trim() || '';
          result += `>${textVal}</${el.tagName}>\n`;
        } else if (nonWhitespaceChildren.length === 0) {
          result += ' />\n';
        } else {
          result += '>\n';
          nonWhitespaceChildren.forEach((child) => serialize(child, depth + 1));
          result += `${spacing}</${el.tagName}>\n`;
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue?.trim();
      if (val) {
        result += `${spacing}${val}\n`;
      }
    } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
      result += `${spacing}<![CDATA[${node.nodeValue}]]>\n`;
    } else if (node.nodeType === Node.COMMENT_NODE) {
      result += `${spacing}<!--${node.nodeValue}-->\n`;
    } else if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      const pi = node as ProcessingInstruction;
      result += `${spacing}<?${pi.target} ${pi.data}?>\n`;
    } else if (node.nodeType === Node.DOCUMENT_NODE) {
      node.childNodes.forEach((child) => {
        // Skip root element since we handle it. Skip XML declaration processing node if parsed as child.
        if (child.nodeType === Node.ELEMENT_NODE || child.nodeType === Node.COMMENT_NODE) {
          serialize(child, depth);
        }
      });
    }
  }

  serialize(doc, 0);
  return result.trim();
}
