/*
  Written by Matt Gross
  06/2010
*/

/*
 Global variables
*/
const ConsoleService =
	Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

const prefManager = 
	Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

var isRecording = false;
const idsToIgnore = ["htmlunitScripterTextbox","urlbar","powerbutton-icon","closeIcon","clearTextbox","pauseButton","recordButton"];
const textFieldTypes = ["text","textarea","password"];

var codeBuffer = "";
var anchorBuffer = "";

/*
 Primary function starts here
*/
var htmlunitScripter = function () {
	return {
		start : function ()
		{
			var startButton = document.getElementById("powerbutton-icon");
			var closeButton = document.getElementById("close-icon");
			var mainWindow = document.getElementById("htmlunitScripterToolbar");
			var textbox = document.getElementById("htmlunitScripterTextbox");
			var pauseButton = document.getElementById("pauseButton");
			var recordButton = document.getElementById("recordButton");
			var variableNumTextBox = document.getElementById("currentVarTextbox");

			pauseButton.disabled = true;
			pauseButton.image = "chrome://htmlunitscripter/skin/pause-glow.png";

			recordButton.disabled = false;
			recordButton.image = "chrome://htmlunitscripter/skin/record.png";

			isRecording = false;
			variableNumTextBox.value = 1;

			startButton.hidden = true;
			closeButton.hidden = false;
			mainWindow.hidden = false;
			textbox.hidden = false;
			textbox.value = "";

			codeBuffer = "";
			anchorBuffer = "";

		},

		close : function ()
		{
			var startButton = document.getElementById("powerbutton-icon");
			var closeButton = document.getElementById("close-icon");
			var mainWindow = document.getElementById("htmlunitScripterToolbar");
			var textbox = document.getElementById("htmlunitScripterTextbox");

			startButton.hidden = false;
			closeButton.hidden = true;
			mainWindow.hidden = true;
			textbox.hidden = true;
		},

		flush : function ()
		{
			var textbox = document.getElementById("htmlunitScripterTextbox");
			textbox.value = textbox.value + codeBuffer + anchorBuffer;
			codeBuffer = "";
		},

		clear : function ()
		{
			var textbox = document.getElementById("htmlunitScripterTextbox");
			textbox.value = "";
			codeBuffer = "";
			anchorBuffer = "";
		},

		onPageLoad : function (event)
		{
			
			if(isRecording)
			{
				var textbox = document.getElementById("htmlunitScripterTextbox");

				// Write out the buffers now for the previous page
				textbox.value = textbox.value + codeBuffer + anchorBuffer;
				codeBuffer = "";
				anchorBuffer = "";

				// Print out the info for the newly loaded page
				if(event.originalTarget instanceof HTMLDocument)
				{
					var useMainFrameOnly = prefManager.getBoolPref("extensions.htmlunitscripter.useMainFrameOnly");

					// Based on the user preferences, filter out frames that are not the main frame. This prevents items
					// like ads in separate frames from showing up, but may prevent other websites from functioning properly.				
					if( (useMainFrameOnly && !event.originalTarget.defaultView.frameElement) || !useMainFrameOnly )
					{
						// Looking for "http" in the URL filters out internal chrome:// URLs
						if(event.originalTarget.URL.indexOf("http")>-1)
						{
							addProgressStatement("Current page: " + event.originalTarget.title);
							textbox.value = textbox.value + "// Current page:\n// Title=" + event.originalTarget.title + "\n// URL=" + event.originalTarget.URL + "\n\n";
						}
					}		
				}
			}				
		},
			
		record : function()
		{
			isRecording = true;

			var pauseButton = document.getElementById("pauseButton");
			var recordButton = document.getElementById("recordButton");

			pauseButton.disabled = false;
			pauseButton.image = "chrome://htmlunitscripter/skin/pause.png";

			recordButton.disabled = true;
			recordButton.image = "chrome://htmlunitscripter/skin/record-glow.png";
		},

		pause : function()
		{
			isRecording = false;

			var pauseButton = document.getElementById("pauseButton");
			var recordButton = document.getElementById("recordButton");

			pauseButton.disabled = true;
			pauseButton.image = "chrome://htmlunitscripter/skin/pause-glow.png";

			recordButton.disabled = false;
			recordButton.image = "chrome://htmlunitscripter/skin/record.png";
		},

		onMouseClick : function(event)
		{
			if(isRecording)
			{			
				var target = event.target;
				var targetAsString = target.toString();
				var linkIsInParent = false;
				var childNode;
			
				// There are a number of situations where there is something else inside the link, and the click event
				// reports that element instead of the link. So check if the parent node is the actual link.
				if(target.parentNode.href)
				{
					childNode = target;
					target = target.parentNode;
					linkIsInParent = true;
				}

				if(target.href)
				{												
					onHtmlLink(target, linkIsInParent, childNode);				
				}
				else if(target.type == "checkbox")
				{
					onCheckBox(target);				
				}
				else if(target.type == "radio")
				{
					onRadioButton(target);				
				}
				else if(target.type == "submit")
				{
					onSubmit(target);
				}			
				else if(targetAsString.indexOf("HTMLSelectElement") > -1)
				{
					// Ignore select lists. We are only interested in the option the user selected.
				}
				else if(targetAsString.indexOf("HTMLOptionElement") > -1)
				{
					onSelectOption(target);
				}
				// We don't know what the element is, but if it has an id, a name or a value, we can try to use it 
				// as a generic HtmlInput
				else if(targetAsString.indexOf("HTMLInputElement") >-1)
				{
					onHtmlInput(target);
				}

				// We can't figure how how to handle the element, so log the error if preferences indicate logging is requested
				else
				{
					if(!isSystemId(target.id))
					{				
						var doLogging = prefManager.getBoolPref("extensions.htmlunitscripter.logging");					
						if(doLogging)
						{
							logMessage("Could not identify clicked element:" + target.toString());
						}
					}
				}
			}
		},

		onChange : function(event)
		{
			if(isRecording)
			{			
				var textbox = document.getElementById("htmlunitScripterTextbox");
				var target = event.target;

				if(target.type == "textarea")
				{
					onTextArea(target);				
				}
				else if(target.type == "text")
				{
					onText(target);
				}
				else if(target.type == "password")
				{
					onPassword(target);
				}
			}
		}
	};
}();

/*
 Event listeners here- need to be below main htmlunitScripter function
*/
//window.addEventListener("click", htmlunitScripter.onMouseClick, false);
window.addEventListener("mousedown", htmlunitScripter.onMouseClick, false);
window.addEventListener("change", htmlunitScripter.onChange, false);
window.addEventListener("DOMContentLoaded", htmlunitScripter.onPageLoad, false);

/* 
 onMouseDown functions (user click mouse on an item)
*/
function onHtmlLink(target, linkIsInParent, childNode)
{
	var targetAsString = target.toString();
	var textbox = document.getElementById("htmlunitScripterTextbox");

	if(target.text && trim(target.text).length > 0)
	{
		var nextNum = getNextNum();					
		var nextNextNum = getNextNum();					
		
		var theCode = "List<HtmlAnchor> anchors" + nextNum + " =  page.getAnchors();\n"
		theCode += "HtmlAnchor link" + nextNextNum + " = null;\n"
		theCode += "for(HtmlAnchor anchor: anchors" + nextNum + ")\n";
		theCode += "{\n";
   		theCode += "     if(anchor.asText().indexOf(\"" + trim(target.text) + "\") > -1 )\n";
   		theCode += "     {\n";
        theCode += "          link" + nextNextNum + " = anchor;\n";
        theCode += "          break;\n";
   		theCode += "     }\n";
		theCode += "}\n";
		theCode += "page = link" + nextNextNum + ".click();\n";
		anchorBuffer = theCode + "\n";
	}
	else if(target.id)
	{
		var nextNum = getNextNum();

		var theCode = "HtmlAnchor anchor" + nextNum + " = (HtmlAnchor) page.getElementById(\"" + target.id + "\");\n";
		theCode += "page = anchor" + nextNum + ".click();\n";
		anchorBuffer = theCode + "\n";

	}
	else if(target.name)
	{
		var nextNum = getNextNum();

		var theCode = "HtmlAnchor anchor" + nextNum + " = (HtmlAnchor) page.getElementByName(\"" + target.name + "\");\n";
		theCode += "page = anchor" + nextNum + ".click();\n";
		anchorBuffer = theCode + "\n";
	}
	else if(linkIsInParent)
	{
		// Useful for when the clicked element (the child here) is an image, the parent href (the target here) is the actual link,
		// and the parent has neither an id nor a name to identify it.
		if(childNode.toString().indexOf("HTMLImageElement") > -1)
		{						
			var nextNum = getNextNum();
			var iterableNum = getNextNum();
			var iteratorNum = getNextNum();

			var theCode = "HtmlElement element" + nextNum + " = null;\n";
			theCode += "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
			theCode += "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
			theCode += "while(i" + iteratorNum + ".hasNext())\n";
			theCode += "{\n";
			theCode += "     HtmlElement anElement = i" + iteratorNum + ".next();\n";
			theCode += "     if(anElement instanceof HtmlImage)\n";
			theCode += "     {\n";
			theCode += "          HtmlImage input = (HtmlImage) anElement;\n";
			theCode += "          String[] elements = \"" + childNode.src + "\".split( \"/\" );\n";
            theCode += "          if(input.getSrcAttribute().indexOf(elements[elements.length-1] )> -1 )\n";
			theCode += "          {\n";
			theCode += "               element" + nextNum + " = input;\n";
			theCode += "               break;\n";
			theCode += "          }\n";
			theCode += "     }\n";
			theCode += "}\n";
			theCode += "page = element" + nextNum + ".click();\n";
			anchorBuffer = theCode + "\n";
		}
	}
	else
	{
		//Last chance; try to capture using href attribute
		var nextNum = getNextNum();
		var listNum = getNextNum();
		var iteratorNum = getNextNum();
		var stringAnchorToFindNum = getNextNum();
		var stringElementsNum = getNextNum();
	
		var theCode = "HtmlAnchor theAnchor" + nextNum + " = null;\n";
		theCode += "List<HtmlAnchor> anchors" + listNum + " = page.getAnchors();\n";
		theCode += "Iterator<HtmlAnchor> i" + iteratorNum + " = anchors" + listNum + ".iterator();\n";
		theCode += "String anchorToFind" + stringAnchorToFindNum + " = \"" + target.href + "\";\n";
		theCode += "String[] anchorToFindElements" + stringElementsNum + " = anchorToFind" + stringAnchorToFindNum  + ".split(\"/\");\n";             				
		theCode += "while(i" + iteratorNum + ".hasNext())\n";		
		theCode += "{\n";
		theCode += "     HtmlAnchor anchor = i" + iteratorNum + ".next();\n";	 
 		theCode += "     if(anchor.getHrefAttribute().indexOf(anchorToFindElements" + stringElementsNum + "[anchorToFindElements" + stringElementsNum + ".length-1]) > -1)\n";
 		theCode += "     {\n";
		theCode += "          theAnchor" + nextNum + " = anchor;\n";
	 	theCode += "          break;\n";
 		theCode += "     }\n";
		theCode += "}\n";
		theCode += "page = theAnchor" + nextNum + ".click();\n";
			
		anchorBuffer = theCode + "\n";
	}
} // End onHtmlLink()

function onCheckBox(target)
{
	var textbox = document.getElementById("htmlunitScripterTextbox");

	if(target.value)
	{
		// TODO If the value is not set, it defaults to "on". Need to see if this is an issue 					
		var nextNum = getNextNum();
		var iterableNum = getNextNum();
		var iteratorNum = getNextNum();

		var theCode = "HtmlInput checkbox" + nextNum + " = null;\n";
 		
		// Try to use the id or name if available
		if(target.id)
		{
			theCode += "Iterable<HtmlElement> iterable" + iterableNum + " = page.getElementsByIdAndOrName(\"" + target.id + "\");\n";
		}
		else if(target.name)
		{
			theCode += "Iterable<HtmlElement> iterable" + iterableNum + " = page.getElementsByIdAndOrName(\"" + target.name + "\");\n";
		}
		else
		{
			theCode += "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
		}

 		theCode += "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
 		theCode += "while(i" + iteratorNum + ".hasNext())\n";
 		theCode += "{\n";
	 	theCode += "     HtmlElement element = i" + iteratorNum + ".next();\n";
	 	theCode += "     if(element instanceof HtmlInput)\n";
	 	theCode += "     {\n";
		theCode += "          HtmlInput input = (HtmlInput) element;\n";
		theCode += "          if(\"" + target.value + "\".equals(input.getValueAttribute() ) )\n";
		theCode += "          {\n";
		theCode += "               checkbox" + nextNum + " = input;\n";
		theCode += "               break;\n";
		theCode += "          }\n";
	 	theCode += "     }\n";
 		theCode += "}\n";
 		theCode += "checkbox" + nextNum + ".click();\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else if(target.id)
	{
		var nextNum = getNextNum();					
		
		var theCode = "HtmlInput checkbox" + nextNum + " = (HtmlInput) page.getElementById(\"" + target.id + "\");\n";
		theCode += "checkbox" + nextNum + ".click();\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else if(target.name)
	{
		var nextNum = getNextNum();					
		
		var theCode = "HtmlInput checkbox" + nextNum + " = (HtmlInput) page.getElementByName(\"" + target.name + "\");\n";
		theCode += "checkbox" + nextNum + ".click();\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else
	{
		codeBuffer = codeBuffer + "// Could not find a way to identify checkbox on page:\n" + 
		"// Neither the the id nor the name nor the value attribute was set on the checkbox\n\n";
	}
} // End onCheckBox()


function onRadioButton(target)
{
	var textbox = document.getElementById("htmlunitScripterTextbox");

	// Radio buttons tend to have the same id/name as they are grouped together. So use the value attribute to find the unique radio button.
	if(target.value)
	{ 					
		var nextNum = getNextNum();		
		var iterableNum = getNextNum();
		var iteratorNum = getNextNum();
 		
		theCode = "HtmlRadioButtonInput radioButton" + nextNum + " = null;\n";

		// Try to use the id or name if available
		if(target.id)
		{
			theCode += "Iterable<HtmlElement> iterable" + iterableNum + " = page.getElementsByIdAndOrName(\"" + target.id + "\");\n";
		}
		else if(target.name)
		{
			theCode += "Iterable<HtmlElement> iterable" + iterableNum + " = page.getElementsByIdAndOrName(\"" + target.name + "\");\n";
		}
		else
		{
			theCode += "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
		}
		
 		theCode += "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
 		theCode += "while(i" + iteratorNum + ".hasNext())\n";
 		theCode += "{\n";
	 	theCode += "     HtmlElement element = i" + iteratorNum + ".next();\n";
	 	theCode += "     if(element instanceof HtmlRadioButtonInput)\n";
	 	theCode += "     {\n";
		theCode += "          HtmlRadioButtonInput input = (HtmlRadioButtonInput) element;\n";
		theCode += "          if(\"" + target.value + "\".equals(input.getValueAttribute() ) )\n";
		theCode += "          {\n";
		theCode += "               radioButton" + nextNum + " = input;\n";
		theCode += "               break;\n";
		theCode += "          }\n";
	 	theCode += "     }\n";
 		theCode += "}\n";
 		theCode += "radioButton" + nextNum + ".click();\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else
	{
		codeBuffer = codeBuffer + "// Could not find a way to identify radio button on page:\n" + 
		"// The value attribute was not set on the radio button\n\n";
	}
} // End onRadioButton()

function onSubmit(target)
{
	var textbox = document.getElementById("htmlunitScripterTextbox");

	if(target.value)
	{
		var nextNum = getNextNum();
		var iterableNum = getNextNum();
		var iteratorNum = getNextNum();

		var theCode = "HtmlSubmitInput submitButton" + nextNum + " = null;\n";
 		theCode += "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
 		theCode += "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
 		theCode += "while(i" + iteratorNum + ".hasNext())\n";
 		theCode += "{";
	 	theCode += "     HtmlElement element = i" + iteratorNum + ".next();\n";
	 	theCode += "     if(element instanceof HtmlSubmitInput)\n";
	 	theCode += "     {\n";
		theCode += "          HtmlSubmitInput input = (HtmlSubmitInput) element;\n";
		theCode += "          if(\"" + target.value + "\".equals(input.getValueAttribute() ) )\n";
		theCode += "          {\n";
		theCode += "               submitButton" + nextNum + " = input;\n";
		theCode += "               break;\n";
		theCode += "          }\n";
	 	theCode += "     }\n";
 		theCode += "}\n";
 		theCode += "page = submitButton" + nextNum + ".click();\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else if(target.id)
	{			
		var nextNum = getNextNum();
		
		var theCode = "HtmlSubmitInput submitButton" + nextNum + " = (HtmlSubmitInput) page.getElementById(\"" + target.id + "\");";
		theCode += "\n";
		theCode += "page = submitButton" + nextNum + ".click();\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else if(target.name)
	{
		var nextNum = getNextNum();
		
		var theCode = "HtmlSubmitInput submitButton" + nextNum + " = (HtmlSubmitInput) page.getElementByName(\"" + target.name + "\");";
		theCode += "\n";
		theCode += "page = submitButton" + nextNum + ".click();\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else
	{
		codeBuffer = codeBuffer + "// Could not find a way to identify submit button on page:\n" + 
		"// Neither the the id nor the name nor the value attribute was set on the submit button\n\n";
	}
} // End onSubmit()

function onSelectOption(target)
{
	var textbox = document.getElementById("htmlunitScripterTextbox");	

	var selectList = target.parentNode;

	if(selectList.id)
	{
		var nextNum = getNextNum();
		var optionsNum = getNextNum();
		var theOptionNum = getNextNum();
		
		var theCode = "HtmlSelect selectField" + nextNum + " = (HtmlSelect) page.getElementById(\"" + selectList.id + "\");\n";		
		theCode += "List<HtmlOption> options" + optionsNum + " = selectField" + nextNum + ".getOptions();\n";
		theCode += "HtmlOption theOption" + theOptionNum + " = null;\n";
		theCode += "for(HtmlOption option: options" + optionsNum + ")\n";
		theCode += "{";
		theCode += "     if(option.getText().equals(\"" + target.text + "\") )\n";
		theCode += "     {\n";
		theCode += "          theOption" + theOptionNum + " = option;\n";
		theCode += "          break;\n";
		theCode += "     }\n";
		theCode += "}\n";
		theCode += "selectField" + nextNum + ".setSelectedAttribute(theOption" + theOptionNum + ", true );\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else if(selectList.name)
	{
		var nextNum = getNextNum();
		var optionsNum = getNextNum();
		var theOptionNum = getNextNum();
		
		var theCode = "HtmlSelect selectField" + nextNum + " = (HtmlSelect) page.getElementByName(\"" + selectList.name + "\");\n";
		theCode += "List<HtmlOption> options" + optionsNum + " = selectField" + nextNum + ".getOptions();\n";
		theCode += "HtmlOption theOption" + theOptionNum + " = null;\n";
		theCode += "for(HtmlOption option: options" + optionsNum + ")\n";
		theCode += "{";
		theCode += "     if(option.getText().equals(\"" + target.text + "\") )\n";
		theCode += "     {\n";
		theCode += "          theOption" + theOptionNum + " = option;\n";
		theCode += "          break;\n";
		theCode += "     }\n";
		theCode += "}\n";
		theCode += "selectField" + nextNum + ".setSelectedAttribute(theOption" + theOptionNum + ", true );\n";
		
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else
	{
		textbox.value = textbox.value + "// Could not find a way to identify select list on page:\n" + 
		"// Neither the the id attribute nor the name attribute was set on the select list\n\n";
	}
} // End onSelectOption

function onHtmlInput(target)
{
	var textbox = document.getElementById("htmlunitScripterTextbox");

	var foundTextFieldType = false;
	for (i in textFieldTypes) 
	{ 
   		if(textFieldTypes[i] == target.type)
		{
			foundTextFieldType = true;
			break;
		}
	}		

	// We don't ever want this to accidentally fire for text fields, for the case where neither the id nor the name was set on the text field. In
	// this case, it would try to pick up the value inside the text field, which could vary according to what the user typed.
	if(!foundTextFieldType)
	{
		if(target.id)
		{
			var nextNum = getNextNum();
		
			var theCode = "HtmlElement theElement" + nextNum + " = (HtmlElement) page.getElementById(\"" + target.id + "\");";
			theCode += "\n";
			theCode += "page = theElement" + nextNum + ".click();\n";
			anchorBuffer = anchorBuffer + theCode + "\n";
		}
		else if(target.name)
		{
			var nextNum = getNextNum();
		
			var theCode = "HtmlElement theElement" + nextNum + " = (HtmlElement) page.getElementByName(\"" + target.name + "\");";
			theCode += "\n";
			theCode += "page = theElement" + nextNum + ".click();\n";
			anchorBuffer = anchorBuffer + theCode + "\n";
		}
		else if(target.value)
		{
			var nextNum = getNextNum();		
			var iterableNum = getNextNum();
			var iteratorNum = getNextNum();

			var theCode = "HtmlInput theElement" + nextNum + " = null;\n";
	 		theCode += "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
	 		theCode += "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
	 		theCode += "while(i" + iteratorNum + ".hasNext())\n";
	 		theCode += "{\n";
		 	theCode += "     HtmlElement element = i" + iteratorNum + ".next();\n";
			theCode += "     if(element instanceof HtmlInput)\n";
		  	theCode += "     {\n";
			theCode += "          HtmlInput input = (HtmlInput) element;\n";
			theCode += "          if(\"" + target.value + "\".equals(input.getValueAttribute() ) )\n";
		    theCode += "          {\n";
		    theCode += "               theElement" + nextNum + " = input;\n";
		    theCode += "               break;\n";
		    theCode += "          }\n";
		  	theCode += "     }\n";
	 		theCode += "}\n";
	 		theCode += "page = theElement" + nextNum + ".click();\n";
			anchorBuffer = anchorBuffer + theCode + "\n";
		}
		else
		{
			anchorBuffer = anchorBuffer + "// Could not find a way to identify generic HtmlInput on page:\n" + 
			"// Neither the the id nor the name nor the value attribute was set on the input\n\n";
		}
	}
	
} // End onHtmlInput

/*
 Onchange events (user adding text via keyboard)
*/
function onTextArea(target)
{
	var textbox = document.getElementById("htmlunitScripterTextbox");	
				
	if(target.id)
	{
		var nextNum = getNextNum();					
		
		var theCode = "HtmlTextArea textArea" + nextNum + " = (HtmlTextArea) page.getElementById(\"" + target.id  + "\");\n";
		theCode += "textArea" + nextNum + ".setTextContent(\"" + target.value + "\");\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else if(target.name)
	{
		var nextNum = getNextNum();
		
		var theCode = "HtmlTextArea textArea" + nextNum + " = (HtmlTextArea) page.getElementByName(\"" + target.name  + "\");\n";
		theCode += "textArea" + nextNum + ".setTextContent(\"" + target.value + "\");\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else
	{
		codeBuffer = codeBuffer + "// Could not find a way to identify text area on page:\n" + 
		"// Neither the id attribute nor the name attribute was set on the text area\n\n";
	}
} // End onTextArea

function onText(target)
{
	var textbox = document.getElementById("htmlunitScripterTextbox");
			
	if(target.id)
	{
		var nextNum = getNextNum();					
				
		var theCode = "HtmlTextInput textField" + nextNum + " = (HtmlTextInput) page.getElementById(\"" + target.id  + "\");\n";
		theCode += "textField" + nextNum + ".setValueAttribute(\"" + target.value + "\");\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else if(target.name)
	{
		var nextNum = getNextNum();					
		
		var theCode = "HtmlTextInput textField" + nextNum + " = (HtmlTextInput) page.getElementByName(\"" + target.name  + "\");\n";
		theCode += "textField" + nextNum + ".setValueAttribute(\"" + target.value + "\");\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else
	{
		codeBuffer = codeBuffer + "// Could not find a way to identify text box on page:\n" + 
		"// Neither the id attribute nor the name attribute was set on the text box\n\n";
	}
} // End onText()

function onPassword(target)
{
	var textbox = document.getElementById("htmlunitScripterTextbox");
			
	if(target.id)
	{
		var nextNum = getNextNum();					
		var theCode = "HtmlPasswordInput passwordField" + nextNum + " = (HtmlPasswordInput) page.getElementById(\"" + target.id  + "\");\n";
		theCode += "passwordField" + nextNum + ".setValueAttribute(\"" + target.value + "\");\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else if(target.name)
	{
		var nextNum = getNextNum();					
		var theCode = "HtmlPasswordInput passwordField" + nextNum + " = (HtmlPasswordInput) page.getElementByName(\"" + target.name  + "\");\n";
		theCode += "passwordField" + nextNum + ".setValueAttribute(\"" + target.value + "\");\n";
		codeBuffer = codeBuffer + theCode + "\n";
	}
	else
	{
		codeBuffer = codeBuffer + "// Could not find a way to identify password box on page:\n" + 
		"// Neither the id attribute nor the name attribute was set on the password box\n\n";
	}
} // End onPassword()

/*
 Auxilary functions
*/


function logMessage(aMessage)
{
    ConsoleService.logStringMessage(aMessage);
}

function trim(theString) 
{
    return theString.replace(/^\s*/, "").replace(/\s*$/, "");
}


function getNextNum()
{
	var variableNumTextBox = document.getElementById("currentVarTextbox");
	var currentVariableNum = variableNumTextBox.value;
	var nextVariableNum = currentVariableNum;
	nextVariableNum++;
	variableNumTextBox.value = nextVariableNum;
	return currentVariableNum;
}


function isSystemId(theId)
{	
	var foundSystemId = false;
	for (i in idsToIgnore) 
	{ 
   		if(idsToIgnore[i] == theId)
		{
			foundSystemId = true;
			break;
		}
	}

	return foundSystemId;
}

function addProgressStatement(additionalText)
{
	var addStatement = prefManager.getBoolPref("extensions.htmlunitscripter.printProgress");

	if(addStatement)
	{
		var textbox = document.getElementById("htmlunitScripterTextbox");
		textbox.value = textbox.value + "System.out.println(\"" + additionalText + "\");\n\n";
	}
}


