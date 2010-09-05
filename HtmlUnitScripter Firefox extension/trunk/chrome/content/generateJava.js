/*
  Written by Matt Gross
  07/2010
*/
var mainWindow;
var url;
var endUrl;
const nl = "\n";
const prefManager = 
	Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

var generateJava = function () {
	return {
		onLoad : function(event)
		{
			mainWindow = window.opener;
			url = window.arguments[0].beginUrl;	
			endUrl = window.arguments[0].endUrl;
		},

		generateJavaCode : function()
		{
			var classCodeTextbox = document.getElementById("generatedJavaTextbox");
			var messagesLabel = document.getElementById("messagesLabel");
			messagesLabel.value = "Messages: ";

			var packageBox = document.getElementById("packageBox");
			var packageText = packageBox.value;

			var classNameBox = document.getElementById("classNameBox");
			var classNameText = classNameBox.value;

			if(packageText == "")
			{
				alert("You must specify a package! Use a value like org.test");
				messagesLabel.value += "You must specify a package name. ";
			}
			else if(classNameText == "")
			{
				alert("You must specify a class name!");
				messagesLabel.value += "You must specify a package name. ";
			}
			else
			{
				var scripterCodeTextbox = mainWindow.document.getElementById("htmlunitScripterTextbox");
				var scripterCode = scripterCodeTextbox.value;

				var theCode = "package ";
				theCode += packageText + ";\n";
				theCode += nl;

				theCode += "import java.io.IOException;\n";
				theCode += "import java.net.MalformedURLException;\n";
				theCode += "import java.net.URLDecoder;\n";
				theCode += "import java.util.Iterator;\n";
				theCode += "import java.util.List;\n";
				theCode += nl;
				theCode += "import org.htmlunit.scripter.HtmlPageSaver;\n";
				theCode += "import org.htmlunit.scripter.MissingPropertyException;\n";
				theCode += nl;
				theCode += "import com.gargoylesoftware.htmlunit.BrowserVersion;\n";
				theCode += "import com.gargoylesoftware.htmlunit.FailingHttpStatusCodeException;\n";
				theCode += "import com.gargoylesoftware.htmlunit.WebClient;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlAnchor;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlElement;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlInput;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlOption;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlPage;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlPasswordInput;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlRadioButtonInput;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlSelect;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlTextArea;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlTextInput;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlSubmitInput;\n";
				theCode += "import com.gargoylesoftware.htmlunit.html.HtmlImage;\n";
				theCode += nl;
				theCode += "public class " + classNameText + nl;
				theCode += "{" + nl;
     			theCode += "     public static void main(String args[])\n";
				theCode += "     {\n";
				theCode += "          HtmlPage page = null;\n";
				theCode += "          boolean savePagesLocally = false;\n";
				theCode += "          String url = \"" + url + "\";\n";
				theCode += nl;
				theCode += "          WebClient webClient = new WebClient( BrowserVersion.FIREFOX_3 );\n";
				theCode += "          webClient.setThrowExceptionOnScriptError(false);\n";
				theCode += nl;
				theCode += "          String savePagesLocallyString = System.getProperty(\"savePagesLocally\");\n";
				theCode += "          if(savePagesLocallyString != null )\n";
				theCode += "          { savePagesLocally = Boolean.valueOf(savePagesLocallyString); }\n";
				theCode += nl;
				theCode += "          HtmlPageSaver pageSaver = null;\n";
				theCode += "          if(savePagesLocally)\n";
				theCode += "          {\n";
		     	theCode += "               String localFilePath = System.getProperty(\"localFilePath\");\n";
				theCode += nl;
		     	theCode += "               if(localFilePath == null)\n";
		     	theCode += "               {\n";
		        theCode += "                    System.out.println( \"localFilePath property needs to be specified on command line, like so:\" +\n";
		        theCode += "                         \"-DlocalFilePath=somefilepath\");\n";
		        theCode += "                    throw new MissingPropertyException(\"localFilePath property was not specified\");\n";
		        theCode += "               }\n";
		        theCode += "               else\n";
		        theCode += "               { pageSaver = new HtmlPageSaver(localFilePath); }\n";
				theCode += "          }\n";
        		theCode += nl;
				theCode += "          try\n";
				theCode += "          {\n";
		     	theCode += "               page = webClient.getPage( url );\n";
				theCode += nl;

				// Add code from the main scripter window
				theCode += scripterCode;

				theCode += addSavePagesStatement(endUrl,"               ");
				theCode += nl;
				theCode += "               System.out.println(\"Test has completed successfully\");\n";
				theCode += "          }\n";
				theCode += "          catch ( FailingHttpStatusCodeException e1 )\n";
				theCode += "          {\n";
		     	theCode += "               System.out.println( \"FailingHttpStatusCodeException thrown:\" + e1.getMessage() );\n";
		     	theCode += "               e1.printStackTrace();\n";
				theCode += nl;
				theCode += addErrorPageStatement(endUrl,"               ");	
				theCode += "          }\n";
				theCode += "          catch ( MalformedURLException e1 )\n";
				theCode += "          {\n";
		     	theCode += "               System.out.println( \"MalformedURLException thrown:\" + e1.getMessage() );\n";
		     	theCode += "               e1.printStackTrace();\n";
				theCode += nl;	
               	theCode += addErrorPageStatement(endUrl,"               ");
				theCode += "           }\n";
				theCode += "          catch ( IOException e1 )\n";
				theCode += "          {\n";
		        theCode += "               System.out.println( \"IOException thrown:\" + e1.getMessage() );\n";
		        theCode += "               e1.printStackTrace();\n";
				theCode += nl;	
               	theCode += addErrorPageStatement(endUrl,"               ");
				theCode += "          }\n";
				theCode += "          catch( Exception e )\n";
          		theCode += "          {\n";
               	theCode += "               System.out.println( \"General exception thrown:\" + e.getMessage() );\n";
               	theCode += "               e.printStackTrace();\n";
               	theCode += nl;	
               	theCode += addErrorPageStatement(endUrl,"               ");
          		theCode += "          }\n";
				theCode += "     }\n";
				theCode += "}\n";

				classCodeTextbox.value = theCode

				var packageAsFolders = packageText.replace(/\./g,"/");
				messagesLabel.value = "Messages: Create a <java source>/" + packageAsFolders +
							"/" + classNameText + ".java and copy and paste the code below into that file.";
			}
		}
	};
}();
window.addEventListener("load", generateJava.onLoad, false);

function addSavePagesStatement(url,whitespace)
{
	var addStatement = prefManager.getBoolPref("extensions.htmlunitscripter.printProgress");

	var theCode = "";
	if(addStatement)
	{
		theCode = whitespace  + "if( savePagesLocally )\n";
		theCode += whitespace + "{\n";
		theCode += whitespace + "     url = \"" + url + "\";\n";  
		theCode += whitespace + "     String fullPath = pageSaver.savePageLocally(page, url);\n";
		theCode += whitespace + "     System.out.println(\"Page with title '\" + page.getTitleText() + \"' saved to \" + fullPath);\n";
		theCode += whitespace + "}\n";
		theCode += "\n";
	}

	return theCode;
}

function addErrorPageStatement(url,whitespace)
{
	var addStatement = prefManager.getBoolPref("extensions.htmlunitscripter.printProgress");

	var theCode = "";
	if(addStatement)
	{
		theCode = whitespace  + "if( savePagesLocally )\n";
		theCode += whitespace + "{\n";
		theCode += whitespace + "     String fullPath = pageSaver.savePageLocally(page, \"error_page.html\", url);\n";
		theCode += whitespace + "     System.out.println(\"Page with title '\" + page.getTitleText() + \"' saved to \" + fullPath);\n";
		theCode += whitespace + "}\n";
		theCode += "\n";
	}

	return theCode;
}


