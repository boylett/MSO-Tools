/**
 * Documentation entry for a VML tag.
 *
 * @param description - Human-readable summary of the tag's purpose.
 * @param attributes - Notable attributes commonly set on this tag.
 * @param example - Short HTML usage example.
 */
export interface VmlTagDoc {
  description: string;
  attributes: string[];
  example: string;
}

export const VML_TAGS: Record<string, VmlTagDoc> = {
  'v:rect': {
    description: 'A rectangle shape. Most commonly used to render background images in Outlook via `<v:fill type="frame">`.',
    attributes: [ 'fillcolor', 'stroke', 'strokecolor', 'strokeweight', 'style', 'filled' ],
    example: '<v:rect fillcolor="#fff" style="width:600px;height:400px;"></v:rect>'
  },
  'v:roundrect': {
    description: 'A rectangle with rounded corners. The cornerstone of bulletproof Outlook buttons.',
    attributes: [ 'arcsize', 'fillcolor', 'stroke', 'strokecolor', 'strokeweight', 'href', 'style' ],
    example: '<v:roundrect arcsize="10%" fillcolor="#0066cc" stroke="f" style="width:200px;height:48px;"></v:roundrect>'
  },
  'v:oval': {
    description: 'An ellipse or circle.',
    attributes: [ 'fillcolor', 'stroke', 'strokecolor', 'style' ],
    example: '<v:oval fillcolor="#0066cc" style="width:48px;height:48px;"></v:oval>'
  },
  'v:line': {
    description: 'A straight line between two points.',
    attributes: [ 'from', 'to', 'strokecolor', 'strokeweight' ],
    example: '<v:line from="0,0" to="100,0" strokecolor="#000" strokeweight="2pt"/>'
  },
  'v:arc': {
    description: 'A circular arc.',
    attributes: [ 'startangle', 'endangle', 'strokecolor', 'fillcolor' ],
    example: '<v:arc startangle="0" endangle="180" style="width:100px;height:100px;"/>'
  },
  'v:curve': {
    description: 'A Bezier curve defined by two control points and an endpoint.',
    attributes: [ 'from', 'control1', 'control2', 'to' ],
    example: '<v:curve from="0,0" control1="50,0" control2="50,50" to="100,50"/>'
  },
  'v:polyline': {
    description: 'A connected sequence of line segments.',
    attributes: [ 'points', 'strokecolor', 'strokeweight' ],
    example: '<v:polyline points="0,0 50,50 100,0"/>'
  },
  'v:fill': {
    description: 'Defines the fill of a parent shape. Use `type="frame"` with `src` to render a background image in Outlook.',
    attributes: [ 'type', 'src', 'color', 'color2', 'opacity', 'angle', 'aspect' ],
    example: '<v:fill type="frame" src="bg.jpg" color="#000"/>'
  },
  'v:stroke': {
    description: 'Defines the stroke (outline) of a parent shape.',
    attributes: [ 'color', 'weight', 'dashstyle', 'endcap', 'joinstyle', 'opacity' ],
    example: '<v:stroke color="#000" weight="2pt" dashstyle="dash"/>'
  },
  'v:shadow': {
    description: 'Drop shadow effect on a parent shape.',
    attributes: [ 'on', 'color', 'offset', 'opacity', 'type' ],
    example: '<v:shadow on="t" color="#888" offset="2pt,2pt"/>'
  },
  'v:image': {
    description: 'Embeds an image. Useful for images that need exact positioning in Outlook.',
    attributes: [ 'src', 'style', 'cropleft', 'cropright', 'croptop', 'cropbottom' ],
    example: '<v:image src="hero.jpg" style="width:600px;height:300px;"/>'
  },
  'v:imagedata': {
    description: 'Image data reference inside a parent shape (typically inside `<v:shape>`).',
    attributes: [ 'src', 'cropleft', 'cropright', 'croptop', 'cropbottom', 'embosscolor' ],
    example: '<v:imagedata src="logo.png"/>'
  },
  'v:shape': {
    description: 'A custom shape defined by a path or a referenced shapetype.',
    attributes: [ 'type', 'style', 'coordsize', 'path', 'fillcolor' ],
    example: '<v:shape type="#mytype" style="width:100px;height:100px;"/>'
  },
  'v:shapetype': {
    description: 'A reusable shape definition referenced by `<v:shape type>`.',
    attributes: [ 'id', 'coordsize', 'path' ],
    example: '<v:shapetype id="mytype" coordsize="100,100" path="m 0,0 l 100,0 100,100 0,100 x e"/>'
  },
  'v:textbox': {
    description: 'A text container inside a VML shape. Inset controls internal padding.',
    attributes: [ 'inset', 'style' ],
    example: '<v:textbox inset="0,0,0,0"><div>Hello</div></v:textbox>'
  },
  'v:textpath': {
    description: 'Text rendered along a path - rarely used in modern email.',
    attributes: [ 'string', 'style' ],
    example: '<v:textpath string="Curved text" style="font-family:Arial;font-size:24pt;"/>'
  },
  'v:group': {
    description: 'Groups child shapes so they share a coordinate system.',
    attributes: [ 'coordsize', 'coordorigin', 'style' ],
    example: '<v:group coordsize="600,400" style="width:600px;height:400px;"></v:group>'
  },
  'v:background': {
    description: 'A background shape for the document. Limited support in Outlook.',
    attributes: [ 'fill', 'fillcolor' ],
    example: '<v:background fillcolor="#000"/>'
  },
  'v:formulas': {
    description: 'Container for `<v:f>` formula definitions used in custom shapes.',
    attributes: [],
    example: '<v:formulas><v:f eqn="sum 0 0 0"/></v:formulas>'
  },
  'v:handles': {
    description: 'Container for shape adjustment handles.',
    attributes: [],
    example: '<v:handles><v:h position="topLeft"/></v:handles>'
  },
  'v:path': {
    description: 'Defines a custom drawing path.',
    attributes: [ 'v', 'limo', 'textboxrect' ],
    example: '<v:path v="m 0,0 l 100,0 100,100 0,100 x e"/>'
  },
  'xml': {
    description: 'Generic XML island used inside an MSO conditional comment to wrap Office settings (`<o:OfficeDocumentSettings>`, etc.). Outlook reads these settings; other clients ignore the block because it is gated by `<!--[if gte mso 9]>`.',
    attributes: [],
    example: '<!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->'
  },
  'o:OfficeDocumentSettings': {
    description: 'Container for Outlook/Office rendering settings. Place inside an `<xml>` block within an `<!--[if gte mso 9]>` conditional comment.',
    attributes: [],
    example: '<o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings>'
  },
  'o:AllowPNG': {
    description: 'Tells Outlook to render PNG images (rather than converting them to a different format). Self-closing flag tag with no attributes or content.',
    attributes: [],
    example: '<o:AllowPNG/>'
  },
  'o:PixelsPerInch': {
    description: 'Sets the DPI Outlook uses to render the document. `96` matches standard web rendering and prevents Outlook from up-scaling images on high-DPI displays.',
    attributes: [],
    example: '<o:PixelsPerInch>96</o:PixelsPerInch>'
  },
  'o:DoNotRelyOnCSS': {
    description: 'Forces Outlook to render using its legacy Word engine rather than relying on CSS. Rarely needed in modern email - usually omitted.',
    attributes: [],
    example: '<o:DoNotRelyOnCSS/>'
  },
  'o:TargetScreenSize': {
    description: 'Hints to Outlook the target screen size for layout decisions. Values match Word document layout sizes.',
    attributes: [],
    example: '<o:TargetScreenSize>1024x768</o:TargetScreenSize>'
  },
  'o:UseFELayout': {
    description: 'Enables Far-East layout features for Asian language rendering.',
    attributes: [],
    example: '<o:UseFELayout/>'
  },
  'o:OLEObject': {
    description: 'Embedded OLE object reference - used for legacy embedded controls.',
    attributes: [ 'Type', 'ProgID', 'ShapeID' ],
    example: '<o:OLEObject Type="Embed" ProgID="..."/>'
  },
  'o:lock': {
    description: 'Locks shape transformations.',
    attributes: [ 'aspectratio', 'rotation', 'position' ],
    example: '<o:lock aspectratio="t"/>'
  },
  'o:p': {
    description: 'Office paragraph marker. Outlook inserts these around content - usually safe to leave alone.',
    attributes: [],
    example: '<o:p>&nbsp;</o:p>'
  },
  'o:shapedefaults': {
    description: 'Default attribute values applied to all shapes without explicit values.',
    attributes: [ 'spidmax', 'fill', 'fillcolor', 'stroke', 'strokecolor' ],
    example: '<o:shapedefaults spidmax="1026"/>'
  },
  'o:shapelayout': {
    description: 'Layout container for shape ID maps.',
    attributes: [ 'v:ext' ],
    example: '<o:shapelayout v:ext="edit"></o:shapelayout>'
  },
  'o:idmap': {
    description: 'Maps shape IDs to layout regions.',
    attributes: [ 'v:ext', 'data' ],
    example: '<o:idmap v:ext="edit" data="1"/>'
  }
};

/**
 * Returns the list of all known VML tag names.
 */
export function getKnownVmlTags(): string[] {
  return Object.keys(VML_TAGS);
}
