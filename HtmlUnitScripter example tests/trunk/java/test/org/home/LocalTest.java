package org.home;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.Iterator;
import java.util.List;

import org.htmlunit.scripter.HtmlPageSaver;
import org.htmlunit.scripter.MissingPropertyException;

import com.gargoylesoftware.htmlunit.BrowserVersion;
import com.gargoylesoftware.htmlunit.FailingHttpStatusCodeException;
import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlAnchor;
import com.gargoylesoftware.htmlunit.html.HtmlButton;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlImage;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.html.HtmlOption;
import com.gargoylesoftware.htmlunit.html.HtmlPage;
import com.gargoylesoftware.htmlunit.html.HtmlPasswordInput;
import com.gargoylesoftware.htmlunit.html.HtmlRadioButtonInput;
import com.gargoylesoftware.htmlunit.html.HtmlSelect;
import com.gargoylesoftware.htmlunit.html.HtmlTextArea;
import com.gargoylesoftware.htmlunit.html.HtmlTextInput;
import com.gargoylesoftware.htmlunit.html.HtmlSubmitInput;

/**
 * This test will use the included here.html file located a few folders up in the 
 * example-tests folder. You can create a script by loading here.html into a Firefox
 * window and then starting HtmlUnitScripter. Copy the script output into the area below
 * starting at the comment "***** Add new code starting here *****".
 * You can run this test either thru Eclipse or on the command line. To save html pages, use these
 * JVM runtime arguments:
 * -DsavePagesLocally=true -DlocalFilePath=somefilepath
 * 
 * @author Matt Gross 8/2010
 *
 */
public class LocalTest
{
     public static void main(String args[])
     {
          HtmlPage page = null;
          boolean savePagesLocally = false;
          
          File file = new File("../../here.html");
          String filePath = null;
          
          if( file.exists() )
          {
        	  try
        	  {
        		  filePath = file.getCanonicalPath();
        	  } 
        	  catch (IOException e)
        	  {
        		  System.out.println( "IOException thrown: " + e.getMessage() );
        		  e.printStackTrace();
        		  System.exit(1);
        	  }
        	  
          }
          else
          {
        	  System.out.println( "File could not be read from location " + file.getPath() + "; exiting now" );
        	  System.exit(1);
          }
          
          String url = "file://" + filePath;
          System.out.println( "Loading html file from " + url );

          WebClient webClient = new WebClient( BrowserVersion.FIREFOX_3 );
          webClient.setThrowExceptionOnScriptError(false);

          String savePagesLocallyString = System.getProperty("savePagesLocally");
          if(savePagesLocallyString != null )
          { savePagesLocally = Boolean.valueOf(savePagesLocallyString); }

          HtmlPageSaver pageSaver = null;
          if(savePagesLocally)
          {
               String localFilePath = System.getProperty("localFilePath");

               if(localFilePath == null)
               {
                    System.out.println( "localFilePath property needs to be specified on command line, like so:" +
                         "-DlocalFilePath=somefilepath");
                    throw new MissingPropertyException("localFilePath property was not specified");
               }
               else
               { pageSaver = new HtmlPageSaver(localFilePath); }
          }

          try
          {
               page = webClient.getPage( url );
               
               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page, url);
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

               // ***** Add new code starting here *****
               
               // ***** Add new code ending here *****

               System.out.println("Test has completed successfully");
          }
          catch ( FailingHttpStatusCodeException e1 )
          {
               System.out.println( "FailingHttpStatusCodeException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page, "error_page.html","file:///home/mattg/HtmlUnit/here.html");
                    System.out.println("Error page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }
          }
          catch ( MalformedURLException e1 )
          {
               System.out.println( "MalformedURLException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page, "error_page.html","file:///home/mattg/HtmlUnit/here.html");
                    System.out.println("Error page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }
           }
          catch ( IOException e1 )
          {
               System.out.println( "IOException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page, "error_page.html","file:///home/mattg/HtmlUnit/here.html");
                    System.out.println("Error page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }
          }
          catch( Exception e )
          {
               System.out.println( "General exception thrown:" + e.getMessage() );
               e.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page, "error_page.html","file:///home/mattg/HtmlUnit/here.html");
                    System.out.println("Error page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }
          }
     }
}
