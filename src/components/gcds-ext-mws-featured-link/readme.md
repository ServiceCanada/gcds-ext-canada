# app-alert



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                                                                      | Type     | Default     |
| ------------- | ------------- | ---------------------------------------------------------------------------------------------------------------- | -------- | ----------- |
| `bgColor`     | `bg-color`    | Background color for the featured link section, as a hex value (e.g. "#FF0000").                                 | `string` | `undefined` |
| `description` | `description` | Description shown under the link. Optional, and takes priority over the `description` slot if both are provided. | `string` | `undefined` |
| `href`        | `href`        | URL for the featured link. Mandatory if the `link` slot is not used.                                             | `string` | `undefined` |
| `linkText`    | `link-text`   | Text for the featured link. Mandatory if the `link` slot is not used.                                            | `string` | `undefined` |


## Slots

| Slot            | Description                                                                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"description"` | Optional. A `<p slot="description">text</p>` used to build the gcds-text shown under the link. Accepts HTML content. Ignored if the `description` prop is set. |
| `"link"`        | An `<a href="url" slot="link">text</a>` used to build the featured gcds-link. Accepts HTML content. Required if the `href` and `link-text` props are not set.  |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
