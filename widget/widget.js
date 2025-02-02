'use strict'
// Write your module here
// It must send an event "frames:loaded" from the top frame containing a list of { name:label } pairs,
// which describes all the fields in each frame.

// This is a template to help you get started, feel free to make your own solution.
function execute() {
	try {
    // Step 1 Scrape Fields and Create Fields list object.
    const fields = getFields(); 

    // Step 2 Add Listener for Top Frame to Receive Fields.
    if (isTopFrame()) {
      window.addEventListener('message', (event) => {
        // - Merge fields from frames.
        // - Process Fields and send event once all fields are collected.
      });
    } else if (!isTopFrame()) {
      // Child frames sends Fields up to Top Frame.
    }
	} catch (e) {
		console.error(e)
	}
}

execute();

// collects form fields from the current frame
function getFields() {
	let fields = [];

  // loop through all input and select elements within the frame
	document.querySelectorAll('input, select').forEach(field => {
		const label = document.querySelector(`label[for="${field.id}"]`);

    // ensure fields collected have both label and name
		if (field.name && label) {
			fields.push({ [field.name]: label.textContent.trim() });
		}
	});
	return fields;
}

// Utility functions to check and get the top frame
// as Karma test framework changes top & context frames.
// Use this instead of "window.top".
function getTopFrame() {
  return window.top.frames[0];
}

function isTopFrame() {
  return window.location.pathname == '/context.html';
}