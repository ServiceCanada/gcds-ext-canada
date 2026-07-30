# app-alert



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                                                       | Type                                           | Default     |
| ------------- | ------------- | ----------------------------------------------------------------- | ---------------------------------------------- | ----------- |
| `alertType`   | `alert-type`  | Controls the colour and icon used for the alert.                  | `"danger" \| "info" \| "success" \| "warning"` | `'info'`    |
| `dismissible` | `dismissible` | When true, renders a button that lets the user dismiss the alert. | `boolean`                                      | `false`     |
| `heading`     | `heading`     | Optional heading shown above the slotted message.                 | `string \| undefined`                          | `undefined` |


## Events

| Event        | Description                                 | Type                |
| ------------ | ------------------------------------------- | ------------------- |
| `appDismiss` | Emitted after the user dismisses the alert. | `CustomEvent<void>` |


## Slots

| Slot | Description                            |
| ---- | -------------------------------------- |
|      | The main message content of the alert. |


## Shadow Parts

| Part               | Description                                     |
| ------------------ | ----------------------------------------------- |
| `"container"`      | The outer container of the alert.               |
| `"dismiss-button"` | The dismiss button, when `dismissible` is true. |
| `"heading"`        | The optional heading element.                   |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
