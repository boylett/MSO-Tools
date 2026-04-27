/**
 * Documentation entry for a VML attribute.
 *
 * @param description - Human-readable summary of the attribute's effect.
 * @param values - Expected value format.
 * @param validOn - VML tags this attribute is commonly used on.
 */
export interface VmlAttrDoc {
  description: string;
  values: string;
  validOn: string[];
}

export const VML_ATTRIBUTES: Record<string, VmlAttrDoc> = {
  'fillcolor': { description: 'Fill colour for the shape interior.', values: 'CSS colour (hex, named, rgb)', validOn: [ 'v:rect', 'v:roundrect', 'v:oval', 'v:shape', 'v:group' ] },
  'strokecolor': { description: 'Outline colour for the shape.', values: 'CSS colour', validOn: [ 'v:rect', 'v:roundrect', 'v:oval', 'v:line', 'v:shape' ] },
  'strokeweight': { description: 'Outline thickness.', values: 'length (pt, px)', validOn: [ 'v:rect', 'v:roundrect', 'v:oval', 'v:line', 'v:shape' ] },
  'stroke': { description: 'Whether the shape has an outline. `t`/`true` enables, `f`/`false` disables.', values: '`t` | `f` | `true` | `false`', validOn: [ 'v:rect', 'v:roundrect', 'v:oval', 'v:shape' ] },
  'filled': { description: 'Whether the shape is filled.', values: '`t` | `f` | `true` | `false`', validOn: [ 'v:rect', 'v:roundrect', 'v:oval', 'v:shape' ] },
  'arcsize': { description: 'Corner radius for `<v:roundrect>`, expressed as a percentage of the shorter side.', values: 'percentage (e.g. `10%`) or fraction (`0.1`)', validOn: [ 'v:roundrect' ] },
  'coordsize': { description: 'Logical coordinate size of the shape\'s drawing surface.', values: 'two integers separated by a comma (e.g. `100,100`)', validOn: [ 'v:shape', 'v:shapetype', 'v:group' ] },
  'coordorigin': { description: 'Origin offset of the shape\'s coordinate system.', values: 'two integers separated by a comma', validOn: [ 'v:shape', 'v:group' ] },
  'path': { description: 'Custom path data for the shape.', values: 'VML path string (e.g. `m 0,0 l 100,0 ... x e`)', validOn: [ 'v:shape', 'v:shapetype' ] },
  'href': { description: 'Click target URL. Combined with `<w:anchorlock/>` to make the whole shape clickable.', values: 'URL', validOn: [ 'v:rect', 'v:roundrect', 'v:oval', 'v:shape', 'v:image' ] },
  'from': { description: 'Starting point.', values: 'two numbers separated by a comma', validOn: [ 'v:line', 'v:curve' ] },
  'to': { description: 'Ending point.', values: 'two numbers separated by a comma', validOn: [ 'v:line', 'v:curve' ] },
  'control1': { description: 'First Bezier control point.', values: 'two numbers separated by a comma', validOn: [ 'v:curve' ] },
  'control2': { description: 'Second Bezier control point.', values: 'two numbers separated by a comma', validOn: [ 'v:curve' ] },
  'startangle': { description: 'Arc start angle in degrees.', values: 'number', validOn: [ 'v:arc' ] },
  'endangle': { description: 'Arc end angle in degrees.', values: 'number', validOn: [ 'v:arc' ] },
  'points': { description: 'Polyline vertex list.', values: 'space-separated `x,y` pairs', validOn: [ 'v:polyline' ] },
  'src': { description: 'Image source URL.', values: 'URL', validOn: [ 'v:fill', 'v:image', 'v:imagedata' ] },
  'type': { description: 'For `<v:fill>`: fill type (e.g. `frame`, `tile`, `gradient`). For `<v:shape>`: references a shapetype id.', values: '`frame` | `tile` | `gradient` | `solid` | shapetype reference', validOn: [ 'v:fill', 'v:shape' ] },
  'color': { description: 'Primary colour (used by fills, strokes, shadows).', values: 'CSS colour', validOn: [ 'v:fill', 'v:stroke', 'v:shadow', 'v:imagedata' ] },
  'color2': { description: 'Secondary colour for gradient fills.', values: 'CSS colour', validOn: [ 'v:fill' ] },
  'opacity': { description: 'Transparency, 0 (transparent) to 1 (opaque).', values: 'number 0-1 or percentage', validOn: [ 'v:fill', 'v:stroke', 'v:shadow' ] },
  'angle': { description: 'Gradient angle in degrees.', values: 'number', validOn: [ 'v:fill' ] },
  'aspect': { description: 'Aspect handling for image fills.', values: '`ignore` | `atMost` | `atLeast`', validOn: [ 'v:fill' ] },
  'inset': { description: 'Internal padding for a `<v:textbox>`. Top, right, bottom, left.', values: 'four lengths separated by commas', validOn: [ 'v:textbox' ] },
  'on': { description: 'Whether the shadow is rendered.', values: '`t` | `f`', validOn: [ 'v:shadow' ] },
  'offset': { description: 'Shadow offset from the shape.', values: '`x,y` length pair', validOn: [ 'v:shadow' ] },
  'cropleft': { description: 'Left crop fraction.', values: '0-1 fraction', validOn: [ 'v:image', 'v:imagedata' ] },
  'cropright': { description: 'Right crop fraction.', values: '0-1 fraction', validOn: [ 'v:image', 'v:imagedata' ] },
  'croptop': { description: 'Top crop fraction.', values: '0-1 fraction', validOn: [ 'v:image', 'v:imagedata' ] },
  'cropbottom': { description: 'Bottom crop fraction.', values: '0-1 fraction', validOn: [ 'v:image', 'v:imagedata' ] },
  'embosscolor': { description: 'Emboss tint colour.', values: 'CSS colour', validOn: [ 'v:imagedata' ] },
  'dashstyle': { description: 'Stroke dash pattern.', values: '`solid` | `shortdash` | `dash` | `longdash` | `dashdot` | `longdashdot` | `longdashdotdot`', validOn: [ 'v:stroke' ] },
  'endcap': { description: 'Stroke end-cap style.', values: '`flat` | `round` | `square`', validOn: [ 'v:stroke' ] },
  'joinstyle': { description: 'Stroke join style.', values: '`round` | `bevel` | `miter`', validOn: [ 'v:stroke' ] },
  'weight': { description: 'Stroke weight.', values: 'length', validOn: [ 'v:stroke' ] },
  'string': { description: 'Text content for `<v:textpath>`.', values: 'string', validOn: [ 'v:textpath' ] },
  'fill': { description: 'Whether the shape fills (legacy boolean).', values: '`t` | `f`', validOn: [ 'v:rect', 'v:background' ] },
  'spidmax': { description: 'Largest shape ID used in the document.', values: 'integer', validOn: [ 'o:shapedefaults' ] },
  'aspectratio': { description: 'Locks the aspect ratio of the shape.', values: '`t` | `f`', validOn: [ 'o:lock' ] },
  'rotation': { description: 'Locks rotation of the shape.', values: '`t` | `f`', validOn: [ 'o:lock' ] },
  'position': { description: 'Locks position of the shape.', values: '`t` | `f`', validOn: [ 'o:lock' ] },
  'v:ext': { description: 'Extension marker - typically `edit`.', values: '`edit` | `view` | `backwardCompatible`', validOn: [ 'o:shapelayout', 'o:idmap' ] },
  'data': { description: 'Numeric data payload (used by `<o:idmap>` for region IDs).', values: 'integer list', validOn: [ 'o:idmap' ] },
  'xmlns:v': { description: 'VML namespace declaration. Required when using `<v:*>` tags.', values: '`urn:schemas-microsoft-com:vml`', validOn: [ 'html' ] },
  'xmlns:o': { description: 'Office namespace declaration. Required when using `<o:*>` tags.', values: '`urn:schemas-microsoft-com:office:office`', validOn: [ 'html' ] },
  'xmlns:w': { description: 'Word namespace declaration. Required when using `<w:*>` tags.', values: '`urn:schemas-microsoft-com:office:word`', validOn: [ 'html' ] },
  'style': { description: 'Inline CSS. VML respects a subset of CSS - sizing and positioning mostly.', values: 'CSS declaration list', validOn: [ 'v:rect', 'v:roundrect', 'v:oval', 'v:shape', 'v:image', 'v:textbox', 'v:group' ] }
};

/**
 * Returns the list of all known VML attribute names.
 */
export function getKnownVmlAttributes(): string[] {
  return Object.keys(VML_ATTRIBUTES);
}
