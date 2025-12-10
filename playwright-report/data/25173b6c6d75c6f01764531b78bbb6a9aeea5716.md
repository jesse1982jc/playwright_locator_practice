# Page snapshot

```yaml
- navigation:
  - link "UITAP":
    - /url: /
  - list:
    - listitem:
      - link "Home":
        - /url: /home
    - listitem:
      - link "Resources":
        - /url: /resources
- heading "AJAX Data" [level=3]
- paragraph: An element may appaear on a page after processing of an AJAX request to a web server. A test should be able to wait for an element to show up.
- heading "Scenario" [level=4]
- list:
  - listitem: Record the following steps. Press the button below and wait for data to appear (15 seconds), click on text of the loaded label.
  - listitem: Then execute your test to make sure it waits for label text to appear.
- heading "Playground" [level=4]
- button "Button Triggering AJAX Request"
- text: 
- contentinfo:
  - link "Fork the website on GitHub":
    - /url: https://github.com/inflectra/ui-test-automation-playground
  - text: . Supported by
  - link "Rapise":
    - /url: https://www.inflectra.com/Rapise/
  - text: test automation team. Copyright © 2020
  - link "Inflectra Corporation":
    - /url: https://www.inflectra.com/
  - text: . This work is licensed under the
  - link "Apache License 2.0":
    - /url: https://www.apache.org/licenses/LICENSE-2.0
  - text: .
```