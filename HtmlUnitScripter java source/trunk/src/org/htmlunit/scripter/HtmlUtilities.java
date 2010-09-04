package org.htmlunit.scripter;

import java.util.ArrayList;
import java.util.List;

public class HtmlUtilities 
{
	/**
	 * Given a String, this method will substitute escape characters for certain values.
	 * The escape sequences are as follows:
	 * ' becomes &apos;
	 * & becomes &amp;
	 * " becomes &quot;
	 * < becomes &lt;
	 * > becomes &gt; 
	 * @param theString the original String
	 * @return the String with escape characters added
	 */
    public static String escapeString(String theString)
	{
		StringBuffer buffer = new StringBuffer();
		char[] chars = theString.toCharArray();
		
		for(int i=0; i<chars.length; i++)
		{
			char theChar = chars[i];
			String newVal = null;
			
			switch(theChar)
			{
			case '\'':
				newVal = "&apos;";
				break;
			case '&':
				newVal = "&amp;";
				break;
			case '\"':
				newVal = "&quot;";
				break;
			case '<':
				newVal = "&lt;";
				break;
			case '>':
				newVal = "&gt;";
				break;
			default:
				newVal = String.valueOf(theChar);
				break;
			}
			
			buffer.append(newVal);
		}
		
		String returnStr = buffer.toString();
		return returnStr;
		
	}
	
	/**
     * Given a line of HTML from a website and a URL,
     * this method will replace relative URLs in the src attribute
     * with the full URL that is provided.
     * @param line the line of HTML code on which to perform the replacement.
     * @param url the full URL to insert.
     * @return a String with the relative URL replaced with the full URL
     */
    public static String srcInsertURL( String line, String url)
    {
        String updatedLine = null;
        
        // Do not perform if this is already a full url
        if( line.indexOf("src=\"http") < 0 )
        {
            String pattern = "src=\"";
            updatedLine = insertUrl( line, url, pattern );
        }
        
        
        return updatedLine;
    }
    
    /**
     * Given a line of HTML from a website and a URL,
     * this method will replace relative URLs in the href attribute
     * with the full URL that is provided.
     * @param line the line of HTML code on which to perform the replacement.
     * @param url the full URL to insert.
     * @return a String with the relative URL replaced with the full URL
     */
    public static String hrefInsertURL( String line, String url )
    {
        String updatedLine = null;
        
        // Do not perform if this is already a full url
        if( line.indexOf("href=\"http") < 0 )
        {
            String pattern = "href=\"";
            updatedLine = insertUrl( line, url, pattern );
        }
        
        
        return updatedLine;
    }
    
    /**
     * Given a line of HTML from a website, a URL, and a pattern,
     * this method will replace relative URLs with the full URL that is provided.
     * An example: 
     * <code>&lt;img src="../images/someImage.gif"></code>
     * will be replaced by this:
     * <code>&lt;img src="http://www.example.com/images/someImage.gif"></code>
     * @param line the line of HTML code on which to perform the replacement.
     * @param url the full URL to insert. Example: <code>http://www.example.com/apps</code>
     * @param pattern the pattern of where the URL should be inserted. Example:
     * <code>"src=\""</code>
     * @return a String with the relative URL replaced with the full URL. If the pattern
     * does not exist in the line, null is returned. 
     */
    public static String insertUrl( String line, String url, String pattern )
    {       
        String modifiedLine = null;
        
        if( line.indexOf(pattern) > -1 )
        {
            String[] fullUrlParts = url.split("//");
            
            String[] urlParts = fullUrlParts[1].split("/");
            String rootUrl = fullUrlParts[0] + "//" + urlParts[0];
            
            List<String> urlPartsList = new ArrayList<String>();
            
            for( int i=0; i< urlParts.length; i++ )
            {
                urlPartsList.add(urlParts[i]);
            }
            
            int patternIndex = line.indexOf(pattern);
            patternIndex += (pattern.length());
            
            String firstPart = line.substring(0, patternIndex);
            String secondPart = line.substring(patternIndex, line.length() );       
            String newSecondPart = secondPart;
            
            // Special case of ./
            if( newSecondPart.startsWith("./") )
            {
            	newSecondPart = newSecondPart.substring( 2 );
            }
            
            // Special case; we are dealing with the root URL
            if( newSecondPart.startsWith("/"))
            {
                modifiedLine = firstPart + rootUrl + secondPart;
            }
            else
            {
                while( newSecondPart.startsWith("../") )
                {
                    urlPartsList.remove(urlPartsList.size()-1 );
                    newSecondPart = newSecondPart.substring(3);
                }
                
                StringBuffer buffer = new StringBuffer();
                buffer.append( firstPart );
                buffer.append( fullUrlParts[0] );
                buffer.append( "//" );
                
                for( String urlFragment: urlPartsList )
                {
                    buffer.append(urlFragment); 
                    buffer.append("/");
                }
                
                buffer.append( newSecondPart );
                modifiedLine = buffer.toString();
            }
            
        }
        
        return modifiedLine;
    }
    
    /**
     * Simple utility method to remove current web page and request parameters from the url
     * @param url the url to clean
     * @return the cleaned url
     */
    public static String removeUrlParams( String url )
    {
         String newUrl = null;
         
         int lastSlash = url.lastIndexOf("/");
         newUrl = url.substring( 0,lastSlash+1 );
         
         return newUrl;
    }
	
	
}
