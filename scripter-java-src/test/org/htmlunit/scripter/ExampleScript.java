package org.htmlunit.scripter;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.Iterator;
import java.util.List;

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

public class ExampleScript
{
     public static void main(String args[])
     {
          HtmlPage page = null;
          boolean savePagesLocally = false;
          String url = "http://www.wikipedia.org/";

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
                    System.err.println( "localFilePath property needs to be specified on command line, like so:" +
                         "-DlocalFilePath=somefilepath");
                    throw new MissingPropertyException("localFilePath property was not specified");
               }
               else
               { pageSaver = new HtmlPageSaver(localFilePath); }
          }

          try
          {
               page = webClient.getPage( url );

               HtmlTextInput textField1 = (HtmlTextInput) page.getElementById("searchInput");
               textField1.setValueAttribute("42");

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page,"http://www.wikipedia.org/");
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

               HtmlSubmitInput submitButton2 = (HtmlSubmitInput) page.getElementByName("go");               
               page = submitButton2.click();

               System.out.println("Current page: 42 - Wikipedia, the free encyclopedia");

               // Current page:
               // Title=42 - Wikipedia, the free encyclopedia
               // URL=http://en.wikipedia.org/wiki/42

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page,"http://en.wikipedia.org/wiki/42");
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

               System.out.println("Test has completed successfully");
          }
          catch ( FailingHttpStatusCodeException e1 )
          {
               System.err.println( "FailingHttpStatusCodeException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page, "error_page.html","http://en.wikipedia.org/wiki/42");
                    System.out.println("Error page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }
          }
          catch ( MalformedURLException e1 )
          {
               System.err.println( "MalformedURLException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page, "error_page.html","http://en.wikipedia.org/wiki/42");
                    System.out.println("Error page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }
           }
          catch ( IOException e1 )
          {
               System.err.println( "IOException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page, "error_page.html","http://en.wikipedia.org/wiki/42");
                    System.out.println("Error page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }
          }
          catch( Exception e )
          {
               System.err.println( "General exception thrown:" + e.getMessage() );
               e.printStackTrace();

               if( savePagesLocally )
               {
                    String fullPath = pageSaver.savePageLocally(page, "error_page.html","http://en.wikipedia.org/wiki/42");
                    System.out.println("Error page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }
          }
     }
}
