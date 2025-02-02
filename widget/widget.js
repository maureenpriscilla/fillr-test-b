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
      handleChildFrame()
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

// function to handle logic for child frame 
function handleChildFrame() {
  // count how many iframe element in this frame 
  const childFrames = countIframes();

  // case 1: if there's no child frame, send fields back to parent frame
  if (childFrames === 0) {} 
  // case 2: if there's child frame, collect fields from child frames
  else {}
}

// function to count all iframe elements in a frame 
function countIframes() {
	return document.getElementsByTagName('iframe').length;
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