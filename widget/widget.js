'use strict'

/**
 * Main execution function that determines if the current window is a top frame or a child frame.
 */
function execute() {
	try {
    // Step 1 Scrape Fields and Create Fields list object.
    const fields = getFields(); 

    // Step 2 Add Listener for Top Frame to Receive Fields.
    if (isTopFrame()) {
      handleTopFrame(fields)
    } else if (!isTopFrame()) {
      // Child frames sends Fields up to Top Frame.
      handleChildFrame(fields)
    }
	} catch (e) {
		console.error(e)
	}
}

execute();

/**
 * Handles logic for top frames, collected all data from child frames
 * @param {Array} fields collected from the current frame
 */
function handleTopFrame(fields) {
  let allFields = [...fields];
	let countFrames = 0

  // count how many iframe element in this frame 
  const totalFrames = countIframes()

  // listen message from child frames
  const message = (event) => {
    // extract type and fields from child frame
    const { type, fields: childFields } = event.data;

    // check if the message type is correct, combined all fields
    if (type === 'fields_data_collected') {
      allFields = allFields.concat(childFields)
      countFrames++
  
      // check if all child frames have responded, trigger custom event frames:loaded
      if (countFrames === totalFrames) {
  
        // sort the fields alphabetically by the first key of each field object
        allFields.sort((fieldA, fieldB) => {
          const keyA = Object.keys(fieldA)[0]
          const keyB = Object.keys(fieldB)[0]
  
          return keyA.localeCompare(keyB)
        })
  
        // trigger custom event frames:loaded
        document.dispatchEvent(new CustomEvent('frames:loaded', {detail: {fields: allFields}}))
  
        // clean up message listener
        window.removeEventListener('message', message)
        }
      }
    }

  // listen message from child frames
  window.addEventListener('message', message);


}

/**
 * Handles logic for child frames, collected all data from nested frames
 * @param {Array} fields collected from the current frame
 */
function handleChildFrame(fields) {
  // count how many iframe element in this frame 
  const childFrames = countIframes();

  // case 1: if there's no child frame, send fields back to parent frame
  if (childFrames === 0) {
    sendFieldsToParent(fields)
  } 
  // case 2: if there's child frame, collect fields from child frames
  else {
    let childFields = [...fields];
		let countChildren = 0;

    const message = (event) => {
      // extract type and fields from child frame
      const {type, fields: nestedFields} = event.data 

      // check if the message type is correct, add nestedFields to childFields
      if (type === 'fields_data_collected') {
        childFields = childFields.concat(nestedFields)
        countChildren++

        // check if all child frames have sent the data, send collected fields back to parent frame
        if (countChildren === childFrames) {
          sendFieldsToParent(childFields);

          // clean up and stop listening for message
          window.removeEventListener('message', message)
        }
      }
    }

    // listen for message from child frames
    window.addEventListener('message', message)


  }
}

/**
 * Collects form fields from the current frame
 * @returns {Array} an array of objects {name:label}
 */
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

/**
 * Used to count all iframe elements in a frame
 * @returns {Number} total number of iframes
 */
function countIframes() {
	return document.getElementsByTagName('iframe').length;
}

/**
 * Used to sends collected form fields data to the parent frame
 * @param {Array} fields collected fields to send to the parent frame
 */
function sendFieldsToParent(fields) {
  try {
    // case 1: if parent frame exist, send fields data to parent frame
		if (window.parent) {
			window.parent.postMessage({ type: 'fields_data_collected', fields }, '*');
    // case 2: if parent frame is not available, log error
		} else {
			console.error('Parent frame does no exist');
		}
	} catch (error) {
		console.error('Error sending fields to parent frame:', error);
	}
}

/**
 * Utility functions to get the top frame, as Karma test framework changes top & context frames. Use this instead of "window.top".
 * @returns {Window} the topmost frame (window object)
 */
function getTopFrame() {
  return window.top.frames[0];
}

/**
 * Utility functions to check the top frame, as Karma test framework changes top & context frames.
 * @returns {Window} the topmost frame (window object)
 */
function isTopFrame() {
  return window.location.pathname == '/context.html';
}