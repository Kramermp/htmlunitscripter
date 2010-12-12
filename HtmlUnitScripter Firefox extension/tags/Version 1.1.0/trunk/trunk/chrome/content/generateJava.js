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

				theCode += "import java.io.BufferedReader;\n";
				theCode += "import java.io.BufferedWriter;\n";
				theCode += "import java.io.File;\n";
				theCode += "import java.io.FileReader;\n";
				theCode += "import java.io.FileWriter;\n";
				theCode += "import java.io.IOException;\n";
				theCode += "import java.net.MalformedURLException;\n";
				theCode += "import java.net.URLDecoder;\n";
				theCode += "import java.util.Iterator;\n";
				theCode += "import java.util.List;\n";
				theCode += "import java.util.Date;\n";
				theCode += "import java.text.SimpleDateFormat;\n";
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
				theCode += "          int pageNum = 1;\n";
          		theCode += "          String localFilePath = null;\n";
				theCode += nl;
				theCode += "          if(savePagesLocally)\n";
				theCode += "          {\n";
		     	theCode += "               localFilePath = System.getProperty(\"localFilePath\");\n";
				theCode += nl;
		     	theCode += "               if(localFilePath == null)\n";
		     	theCode += "               {\n";
		        theCode += "                    System.out.println( \"localFilePath property needs to be specified on command line, like so:\" +\n";
		        theCode += "                         \"-DlocalFilePath=somefilepath\");\n";
		        theCode += "                    throw new RuntimeException(\"localFilePath property was not specified\");\n";
		        theCode += "               }\n";
				theCode += "               else\n";
               	theCode += "               {\n";
            	theCode += "                    String osName = System.getProperty(\"os.name\");\n";
				theCode += "                    String separator = null;\n";
				theCode += nl;
                theCode += "                    if(osName.indexOf(WINDOWS_OS) > -1)\n";
         		theCode += "                    { separator = \"\\\\\"; }\n";
         		theCode += "                    else // UNIX-style path\n";
         		theCode += "                    { separator = \"/\"; }\n";
				theCode += nl;
				theCode += "                    if( !localFilePath.endsWith(separator) )\n";
                theCode += "                    { localFilePath += separator; }\n";
				theCode += nl;
				theCode += "                    // Create a new folder for local files- folder name is current date and time\n";
                theCode += "                    SimpleDateFormat sd = new SimpleDateFormat(\"MM-dd-yyyy_HH_mm\");\n";
                theCode += "                    String formattedDate = sd.format(new Date());\n";
                theCode += "                    localFilePath += formattedDate + separator;\n";
                theCode += "                    File newLocalFolder = new File(localFilePath);\n";
                theCode += "                    boolean success = newLocalFolder.mkdir();\n";
                theCode += nl;    
                theCode += "                    if(!success)\n";
                theCode += "                    { throw new RuntimeException(\"Could not create new folder at location \" + localFilePath); }\n";
				theCode += nl;
                theCode += "                }\n";
				theCode += "          }\n";
        		theCode += nl;
				theCode += "          try\n";
				theCode += "          {\n";
		     	theCode += "               page = webClient.getPage( url );\n";
				theCode += nl;

				// Add code from the main scripter window
				theCode += scripterCode;

				theCode += addSavePagesStatement("               ");
				theCode += nl;
				theCode += "               System.out.println(\"Test has completed successfully\");\n";
				theCode += "          }\n";
				theCode += "          catch ( FailingHttpStatusCodeException e1 )\n";
				theCode += "          {\n";
		     	theCode += "               System.out.println( \"FailingHttpStatusCodeException thrown:\" + e1.getMessage() );\n";
		     	theCode += "               e1.printStackTrace();\n";
				theCode += nl;
				theCode += addErrorPageStatement("               ");	
				theCode += "          }\n";
				theCode += "          catch ( MalformedURLException e1 )\n";
				theCode += "          {\n";
		     	theCode += "               System.out.println( \"MalformedURLException thrown:\" + e1.getMessage() );\n";
		     	theCode += "               e1.printStackTrace();\n";
				theCode += nl;	
               	theCode += addErrorPageStatement("               ");
				theCode += "          }\n";
				theCode += "          catch ( IOException e1 )\n";
				theCode += "          {\n";
		        theCode += "               System.out.println( \"IOException thrown:\" + e1.getMessage() );\n";
		        theCode += "               e1.printStackTrace();\n";
				theCode += nl;	
               	theCode += addErrorPageStatement("               ");
				theCode += "          }\n";
				theCode += "          catch( Exception e )\n";
          		theCode += "          {\n";
               	theCode += "               System.out.println( \"General exception thrown:\" + e.getMessage() );\n";
               	theCode += "               e.printStackTrace();\n";
               	theCode += nl;	
               	theCode += addErrorPageStatement("               ");
          		theCode += "          }\n";
				theCode += "     }\n";
				theCode += nl;
     			theCode += "     public static final String WINDOWS_OS = \"Windows\";\n";
     			theCode += "     public static final String ERROR_PAGE = \"error_page\";\n";
				theCode += "     public static final String STANDARD_PAGE = \"output\";\n";
				theCode += nl;
     			theCode += "     protected static String savePageLocally(HtmlPage page, String filePath, int pageNum)\n";
     			theCode += "     {\n";
    	 		theCode += "          return savePageLocally(page, filePath, false, pageNum);\n";
     			theCode += "     }\n";
				theCode += nl;
				theCode += "     protected static String savePageLocally(HtmlPage page, String filePath, boolean isErrorPage, int pageNum)\n";
     			theCode += "     {\n";
    	 		theCode += "          String fullFilePath = null;\n";
    	 		theCode += "          if( isErrorPage )\n";
    	 		theCode += "          { fullFilePath = filePath + ERROR_PAGE; }\n";
    	 		theCode += "          else\n";
    	 		theCode += "          { fullFilePath = filePath + STANDARD_PAGE + \"_\" + pageNum; }\n";
				theCode += nl;
    	 		theCode += "          File saveFolder = new File(fullFilePath);\n";
				theCode += nl;
    	 		theCode += "          // Overwrite the standard HtmlUnit .html page to add diagnostic info at the top\n";
         		theCode += "          File webPage = new File(fullFilePath + \".html\");\n";
         		theCode += "          BufferedWriter writer = null;\n";
				theCode += "          BufferedReader reader = null;\n";
         		theCode += "          try\n";
         		theCode += "          {\n";
        	 	theCode += "               // Save all the images and css files using the HtmlUnit API\n";
        	 	theCode += "               page.save(saveFolder);\n";
				theCode += nl;
               	theCode += "               reader = new BufferedReader( new FileReader( webPage) );\n";
               	theCode += "               StringBuffer buffer = new StringBuffer();\n";
               	theCode += nl;
               	theCode += "               String line;\n";
               	theCode += "               while( (line = reader.readLine() ) != null )\n";
               	theCode += "               {\n";
            	theCode += "                    buffer.append( line );\n";
            	theCode += "                    buffer.append(\"\\n\");\n";
                theCode += "               }\n";
        	 	theCode += nl;
        	 	theCode += "               writer = new BufferedWriter( new FileWriter( webPage ) );\n";
      	   		theCode += nl;
      	   	 	theCode += "               // Diagnostic info\n";
      	   	 	theCode += "               Throwable t = new Throwable();\n";
             	theCode += "               StackTraceElement[] trace= t.getStackTrace();\n";
            	theCode += nl;
             	theCode += "               // Get the line of code that called this method\n";
             	theCode += "               StackTraceElement callingElement = trace[trace.length-1];\n";
             	theCode += "               writer.write( \"Java code: \" + callingElement.toString() + \"&nbsp;\");\n";
             	theCode += nl;
             	theCode += "               if( isErrorPage )\n";
             	theCode += "               { writer.write( \"<a href=\" + STANDARD_PAGE + \"_\" + (pageNum-1) + \".html>Previous</a>\" ); }\n";
             	theCode += "               else\n";
             	theCode += "               {\n";
            	theCode += "                    if( pageNum > 1)\n";
                theCode += "                    { writer.write( \"<a href=\" + STANDARD_PAGE + \"_\" + (pageNum-1) + \".html>Previous</a>\" ); }\n";
            	theCode += nl; 
            	theCode += "                    writer.write( \"&nbsp;<a href=\" + STANDARD_PAGE + \"_\" + (pageNum+1) + \".html>Next</a>\" );\n";                 
                theCode += "                    writer.write( \"&nbsp;<a href=\" + ERROR_PAGE + \".html>Error page</a><br>\");\n";
             	theCode += "               }\n";
      	   		theCode += nl;
      	     	theCode += "               // Main body of page as seen by HTMLUnit\n";
      	     	theCode += "               writer.write( buffer.toString() );\n";
                theCode += "          }\n";
        		theCode += "          catch ( IOException e )\n";
        		theCode += "          {\n";
             	theCode += "               System.out.println( \"IOException was thrown: \" + e.getMessage() );\n";
             	theCode += "               e.printStackTrace();\n";
        		theCode += "          }\n";
        		theCode += "          finally\n";
        		theCode += "          {\n";
        		theCode += "               if( writer != null )\n";
            	theCode += "               {\n";
        		theCode += "                    try\n";
                theCode += "                    {\n";
        		theCode += "                         writer.flush();\n";
                theCode += "                         writer.close();\n";
                theCode += "                    }\n";
                theCode += "                    catch ( IOException e )\n";
                theCode += "                    { }\n";
            	theCode += "               }\n";
        		theCode += "               if( reader != null )\n";
            	theCode += "               {\n";
        		theCode += "                    try\n";
                theCode += "                    {\n";
                theCode += "                         reader.close();\n";
                theCode += "                    }\n";
                theCode += "                    catch ( IOException e )\n";
                theCode += "                    { }\n";
            	theCode += "               }\n";
        		theCode += "          }\n";
        		theCode += nl;
        		theCode += "          return fullFilePath + \".html\";\n";
    			theCode += "     }\n";
				theCode += "}\n";

				classCodeTextbox.value = theCode;

				var packageAsFolders = packageText.replace(/\./g,"/");
				messagesLabel.value = "Messages: Create a <java source>/" + packageAsFolders +
							"/" + classNameText + ".java file and copy and paste the code below into that file.";
			}
		}
	};
}();
window.addEventListener("load", generateJava.onLoad, false);

function addSavePagesStatement(whitespace)
{
	var addStatement = prefManager.getBoolPref("extensions.htmlunitscripter.printProgress");

	var theCode = "";
	if(addStatement)
	{
		theCode = whitespace  + "if( savePagesLocally )\n";
		theCode += whitespace + "{\n";
		theCode += whitespace + "     String fullPath = savePageLocally(page, localFilePath, pageNum);\n";
        theCode += whitespace + "     pageNum++;\n";
		theCode += whitespace + "     System.out.println(\"Page with title '\" + page.getTitleText() + \"' saved to \" + fullPath);\n";
		theCode += whitespace + "}\n";
		theCode += "\n";
	}

	return theCode;
}

function addErrorPageStatement(whitespace)
{
	var addStatement = prefManager.getBoolPref("extensions.htmlunitscripter.printProgress");

	var theCode = "";
	if(addStatement)
	{
		theCode = whitespace  + "if( savePagesLocally )\n";
		theCode += whitespace + "{\n";
		theCode += whitespace + "     String fullPath = savePageLocally(page, localFilePath, true, pageNum);\n";
		theCode += whitespace + "     System.out.println(ERROR_PAGE + \" saved to \" + fullPath);\n";
		theCode += whitespace + "}\n";
		theCode += "\n";
	}

	return theCode;
}


