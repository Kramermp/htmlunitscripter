package org.home;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLDecoder;
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

public class SourceForgeTest
{
     public static void main(String args[])
     {
          HtmlPage page = null;
          boolean savePagesLocally = false;
          String url = "http://htmlunit.sourceforge.net/";

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

               System.out.println("Current page: SourceForge.net: Download and Develop Open Source Software for Free");

               // Current page:
               // Title=SourceForge.net: Download and Develop Open Source Software for Free
               // URL=http://sourceforge.net/

               HtmlTextInput textField1 = (HtmlTextInput) page.getElementByName("words");
               textField1.setValueAttribute("htmlunit");

               if( savePagesLocally )
               {
                    url = "http://sourceforge.net/";
                    String fullPath = pageSaver.savePageLocally(page, url);
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

               List<HtmlElement> elements2 = (List<HtmlElement>) page.getByXPath("(//button[@type = 'submit'])[1]");
               HtmlSubmitInput submitButton3 = (HtmlSubmitInput) elements2.get(0);
               page = submitButton3.click();

               System.out.println("Current page: SourceForge.net: Software Search");

               // Current page:
               // Title=SourceForge.net: Software Search
               // URL=http://sourceforge.net/search/?type_of_search=soft&words=htmlunit

               if( savePagesLocally )
               {
                    url = "http://sourceforge.net/search/?type_of_search=soft&words=htmlunit";
                    String fullPath = pageSaver.savePageLocally(page, url);
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
                    url = "http://sourceforge.net/search/?type_of_search=soft&words=htmlunit";
                    String fullPath = pageSaver.savePageLocally(page, url);
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

          }
          catch ( MalformedURLException e1 )
          {
               System.err.println( "MalformedURLException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    url = "http://sourceforge.net/search/?type_of_search=soft&words=htmlunit";
                    String fullPath = pageSaver.savePageLocally(page, url);
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

           }
          catch ( IOException e1 )
          {
               System.err.println( "IOException thrown:" + e1.getMessage() );
               e1.printStackTrace();

               if( savePagesLocally )
               {
                    url = "http://sourceforge.net/search/?type_of_search=soft&words=htmlunit";
                    String fullPath = pageSaver.savePageLocally(page, url);
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

          }
          catch( Exception e )
          {
               System.err.println( "General exception thrown:" + e.getMessage() );
               e.printStackTrace();

               if( savePagesLocally )
               {
                    url = "http://sourceforge.net/search/?type_of_search=soft&words=htmlunit";
                    String fullPath = pageSaver.savePageLocally(page, url);
                    System.out.println("Page with title '" + page.getTitleText() + "' saved to " + fullPath);
               }

          }
     }
}
