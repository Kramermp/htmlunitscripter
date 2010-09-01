package org.htmlunit.scripter;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.gargoylesoftware.htmlunit.html.HtmlPage;

/**
 * Helper class to save off Page objects to the local file system.
 * @author Matt Gross
 *
 */
public class HtmlPageSaver
{    
     private String filePath = null;
     private int pageNum = 1;
     public static final String WINDOWS_OS = "Windows";
     public static final String ERROR_PAGE = "error_page";
     
     /**
      * Default constructor
      */
     public HtmlPageSaver()
     { }
     
     /**
      * Main constructor
      * @param filePath Set to the folder of where all the generated html files will be stored. Note
      * that this program will not create new folders for you.
      * @param baseUrl the base URL of the website, such as http://www.example.com
      */
     public HtmlPageSaver( String filePath )
     {
         String osName = System.getProperty("os.name");
    	 
         if(osName.indexOf(WINDOWS_OS) > -1)
         {
        	 if( !filePath.endsWith("\\") )
        	 {
        		 filePath += "\\";
        	 }
         }
         else // UNIX-style path
         {
        	 if( !filePath.endsWith("/") )
             {
            	 filePath += "/";
             }
         }
    	 
    	 
    	 this.filePath = filePath;
          
          clearCreateFolder();
     }
     
     /**
      * Creates the folder for .html files. The folder is deleted if it currently exists.
      */
     public void clearCreateFolder()
     {
          File outputFolder = new File( this.filePath );
          
          if( outputFolder.exists() )
          {
               File[] files = outputFolder.listFiles();
               for(File file: files)
               {
                    file.delete();
               }
               
               outputFolder.delete();
          }
          
          outputFolder.mkdir();
     }
     
     /**
      * Saves a Page object from HtmlUnit on the local machine. This method works by getting the
      * Page as XML and then stores that XML in an .html file. An internal counter is incremented
      * every time this method is called, so that pages will have names like "output_1.html". 
      * <b>Previous</b> and <b>Next</b> links are also added to the top of each page to allow
      * for easy navigation thru the pages. Finally, the "src" and "href" attributes on the 
      * page are modified to insert absolute URLs instead of relative URLs. This allows you
      * to view the pages in your local browser with images and css formatting intact.
      * @param page the Page object to save
      * @param The URL from the location bar. This URL will be parsed after the last "/" character,
      * so you can grab it directly from the Firefox URL bar.
      * @return a String that contains the full path of the .html file that was saved
      */
     public String savePageLocally( HtmlPage page, String url)
     {
          String fileName = "output_" + pageNum + ".html";
          String outputFilePath = savePageLocally( page, fileName, url);
          pageNum++;
          
          return outputFilePath;
     }
     
     /**
      * Saves a Page object from HtmlUnit on the local machine. This method works by getting the
      * Page as XML and then stores that XML in an .html file. An internal counter is incremented
      * every time this method is called, so that pages will have names like "output_1.html". 
      * <b>Previous</b> and <b>Next</b> links are also added to the top of each page to allow
      * for easy navigation thru the pages. Finally, the "src" and "href" attributes on the 
      * page are modified to insert absolute URLs instead of relative URLs. This allows you
      * to view the pages in your local browser with images and css formatting intact.
      * @param page the Page object to save
      * @param fileName Specify a file name for the .html file
      * @param url The URL from the location bar. This URL will be parsed after the last "/" character,
      * so you can grab it directly from the Firefox URL bar.
      * @return a String that contains the full path of the .html file that was saved
      */
     public String savePageLocally( HtmlPage page, String fileName, String url)
     {
          url = HtmlUtilities.removeUrlParams( url );
          
          String[] pageLines = page.asXml().split( "\n" );
          String outputFileString = filePath + fileName;
          File outputFile = new File( outputFileString );
          BufferedWriter writer = null;
          try
          {
               writer = new BufferedWriter( new FileWriter( outputFile ) );
               
               Throwable t = new Throwable();
               StackTraceElement[] trace= t.getStackTrace();
               StackTraceElement callingElement = null;
               
               for( StackTraceElement element: trace )
               {
                    if( !HtmlPageSaver.class.getName().equals( element.getClassName() ) )
                    {
                         callingElement = element;
                         break;
                    }
               }
               
               writer.write( "Java code: " + callingElement.toString() );
               writer.write( "<br>" );
               
               if( pageNum > 1)
               {
                    writer.write( "<a href=\"output_" + (pageNum-1) + ".html\">Previous</a>" );
               }
               
               if( !ERROR_PAGE.equals( fileName ) )
               {
            	   writer.write( "&nbsp;<a href=\"output_" + (pageNum+1) + ".html\">Next</a>\n" );
                   
                   writer.write( "&nbsp;<a href=\"error_page.html\">Error ppage</a>\n<br>\n");
               }
               
               
               for(int i=0; i<pageLines.length; i++)
               {
                    String nextLine = pageLines[i];
                    
                    String outputLine = null;
                    
                    String modifiedNextLineForSrc = HtmlUtilities.srcInsertURL( nextLine, url );
                    
                    if( modifiedNextLineForSrc != null )
                    {
                        outputLine = modifiedNextLineForSrc;
                    }
                    else
                    {
                        outputLine = nextLine;
                    }
                    
                    String modifiedNextLineForHref = HtmlUtilities.hrefInsertURL( outputLine, url );
                    
                    if( modifiedNextLineForHref != null )
                    {
                        outputLine = modifiedNextLineForHref;
                    }
                    
                    if( outputLine != null )
                    {
                        writer.write( outputLine );
                    }
                    else
                    {
                        writer.write( nextLine );
                    }
                    
                    writer.write("\n");
               }
               
          }
          catch ( IOException e )
          {
               System.err.println( "IOException was thrown: " + e.getMessage() );
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
                    {
                         // No-op here
                    }
                    
               }
          }
          
          return outputFileString;
     }
     
     
}
