package org.home;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLDecoder;
import java.util.Iterator;
import java.util.List;
import java.util.Date;
import java.text.SimpleDateFormat;

import org.htmlunit.scripter.HtmlPageSaver;
import org.htmlunit.scripter.MissingPropertyException;

import com.gargoylesoftware.htmlunit.BrowserVersion;
import com.gargoylesoftware.htmlunit.FailingHttpStatusCodeException;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlAnchor;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.html.HtmlOption;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.HtmlPasswordInput;
import com.gargoylesoftware.htmlunit.html.HtmlRadioButtonInput;
import com.gargoylesoftware.htmlunit.html.HtmlSelect;
import com.gargoylesoftware.htmlunit.html.HtmlTextArea;
import com.gargoylesoftware.htmlunit.html.HtmlTextInput;
import com.gargoylesoftware.htmlunit.html.HtmlSubmitInput;
import com.gargoylesoftware.htmlunit.html.HtmlImage;

/**
 * This test will access http://www.google.com, add "HtmlUnit" to the search box, run the search,
 * and click on the first link that appears. To save the web pages to the local file system as they
 * are being accessed, use these command-line arguments (VM arguments in the Eclipse runtime):
 * -DsavePagesLocally=true -DlocalFilePath=yourFilePath
 * 
 * @author mattg
 *
 */
public class GoogleTest
{
     public static void main(String args[])
     {
          HtmlPage page = null;
          boolean savePagesLocally = false;
          
       // The base url of where to start the test
          String url = "http://www.google.com/";

          // Simulate Firefox 3 and turn off throwing exceptions for Javascript
          // errors (will not prevent all Javascript errors from throwing exceptions)
          WebClient webClient = new WebClient( BrowserVersion.FIREFOX_3 );
          webClient.setThrowExceptionOnScriptError(false);

          String savePagesLocallyString = System.getProperty("savePagesLocally");
          if(savePagesLocallyString != null )
          { savePagesLocally = Boolean.valueOf(savePagesLocallyString); }

          int pageNum = 1;
          String localFilePath = null;

          if(savePagesLocally)
          {
               localFilePath = System.getProperty("localFilePath");

               if(localFilePath == null)
               {
                    System.out.println( "localFilePath property needs to be specified on command line, like so:" +
                         "-DlocalFilePath=somefilepath");
                    throw new RuntimeException("localFilePath property was not specified");
               }
               else
               {
                    String osName = System.getProperty("os.name");
                    String separator = null;

                    if(osName.indexOf(WINDOWS_OS) > -1)
                    { separator = "\\"; }
                    else // UNIX-style path
                    { separator = "/"; }

                    if( !localFilePath.endsWith(separator) )
                    { localFilePath += separator; }

                    // Create a new folder for local files- folder name is current date and time
                    SimpleDateFormat sd = new SimpleDateFormat("MM-dd-yyyy_HH_mm");
                    String formattedDate = sd.format(new Date());
                    localFilePath += formattedDate + separator;
                    File newLocalFolder = new File(localFilePath);
                    boolean success = newLocalFolder.mkdir();

                    if(!success)
                    { throw new RuntimeException("Could not create new folder at location " + localFilePath); }

                }
          }

       // The actual test starts here
          try
          {
               page = webClient.getPage( url );

            // The search box on Google
               HtmlTextInput textField1 = (HtmlTextInput) page.getElementByName("q");
               textField1.setValueAttribute("HtmlUnit");

               if( savePagesLocally )
               {
                    String fullPath = savePageLocally(page, localFilePath, pageNum);
                    pageNum++;
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

               HtmlElement theElement2 = (HtmlElement) page.getElementByName("btnG");               
               page = theElement2.click();

               if( savePagesLocally )
               {
                    String fullPath = savePageLocally(page, localFilePath, pageNum);
                    pageNum++;
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

            // Click on the first search result link that contains "HtmlUnit"
               List<HtmlAnchor> anchors3 =  page.getAnchors();
               HtmlAnchor link4 = null;
               for(HtmlAnchor anchor: anchors3)
               {
                    if(anchor.asText().indexOf("HtmlUnit") > -1 )
                    {
                         link4 = anchor;
                         break;
                    }
               }
               page = link4.click();

               System.out.println("Current page: ");

               // Current page:
               // Title=
               // URL=http://www.google.com/url?sa=t&source=web&cd=1&sqi=2&ved=0CB0QFjAA&url=http%3A%2F%2Fhtmlunit.sourceforge.net%2F&rct=j&q=HtmlUnit&ei=tne6TMbRBYGgsQPgu4WADw&usg=AFQjCNHPMijLD6lsJhr_pTp_Ysz3XN3dHA&sig2=q2Ea1GqXW0k1hYN5hlZM6A

               System.out.println("Current page: HtmlUnit - Welcome to HtmlUnit");

               // Current page:
               // Title=HtmlUnit - Welcome to HtmlUnit
               // URL=http://htmlunit.sourceforge.net/

               if( savePagesLocally )
               {
                    String fullPath = savePageLocally(page, localFilePath, pageNum);
                    pageNum++;
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }


               System.out.println("Test has completed successfully");
          }
          catch ( FailingHttpStatusCodeException e1 )
          {
               System.out.println( "FailingHttpStatusCodeException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = savePageLocally(page, localFilePath, true, pageNum);
                    System.out.println(ERROR_PAGE + " saved to " + fullPath);
               }

          }
          catch ( MalformedURLException e1 )
          {
               System.out.println( "MalformedURLException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = savePageLocally(page, localFilePath, true, pageNum);
                    System.out.println(ERROR_PAGE + " saved to " + fullPath);
               }

          }
          catch ( IOException e1 )
          {
               System.out.println( "IOException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = savePageLocally(page, localFilePath, true, pageNum);
                    System.out.println(ERROR_PAGE + " saved to " + fullPath);
               }

          }
          catch( Exception e )
          {
               System.out.println( "General exception thrown:" + e.getMessage() );
               e.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = savePageLocally(page, localFilePath, true, pageNum);
                    System.out.println(ERROR_PAGE + " saved to " + fullPath);
               }

          }
     }

     public static final String WINDOWS_OS = "Windows";
     public static final String ERROR_PAGE = "error_page";
     public static final String STANDARD_PAGE = "output";

     protected static String savePageLocally(HtmlPage page, String filePath, int pageNum)
     {
          return savePageLocally(page, filePath, false, pageNum);
     }

     protected static String savePageLocally(HtmlPage page, String filePath, boolean isErrorPage, int pageNum)
     {
          String fullFilePath = null;
          if( isErrorPage )
          { fullFilePath = filePath + ERROR_PAGE + ".html"; }
          else
          { fullFilePath = filePath + STANDARD_PAGE + "_" + pageNum + ".html"; }

          File saveFolder = new File(fullFilePath);

          // Overwrite the standard HtmlUnit .html page to add diagnostic info at the top
          File webPage = new File(fullFilePath);
          BufferedWriter writer = null;
          try
          {
               // Delete the standard HtmlUnit .html page
               if(webPage.exists())
               { webPage.delete(); }

               // Save all the images and css files using the HtmlUnit API
               page.save(saveFolder);

               writer = new BufferedWriter( new FileWriter( webPage ) );

               // Diagnostic info
               Throwable t = new Throwable();
               StackTraceElement[] trace= t.getStackTrace();

               // Get the line of code that called this method
               StackTraceElement callingElement = trace[trace.length-1];
               writer.write( "Java code: " + callingElement.toString() + "&nbsp;");

               if( isErrorPage )
               { writer.write( "<a href=" + STANDARD_PAGE + "_" + (pageNum-1) + ".html>Previous</a>" ); }
               else
               {
                    if( pageNum > 1)
                    { writer.write( "<a href=" + STANDARD_PAGE + "_" + (pageNum-1) + ".html>Previous</a>" ); }

                    writer.write( "&nbsp;<a href=" + STANDARD_PAGE + "_" + (pageNum+1) + ".html>Next</a>" );
                    writer.write( "&nbsp;<a href=" + ERROR_PAGE + ".html>Error page</a><br>");
               }

               // Main body of page as seen by HTMLUnit
               writer.write( page.asXml() );
          }
          catch ( IOException e )
          {
               System.out.println( "IOException was thrown: " + e.getMessage() );
               e.printStackTrace();
          }
          finally
          {
               if( writer != null )
               {
                    try
                    {
                         writer.flush();
                         writer.close();
                    }
                    catch ( IOException e )
                    { }
               }
          }

          return fullFilePath;
     }
}
