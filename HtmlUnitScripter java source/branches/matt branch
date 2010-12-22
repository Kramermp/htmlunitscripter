package org.htmlunit.scripter;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Stack;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.htmlunit.scripter.HtmlPageSaver;

import junit.framework.TestCase;

public class SrcReplacerTest extends TestCase
{
	
	/**
	 * Lower folder
	 */
	public void testReplaceSrc1()
	{		
		String imageTag = "<img src=\"images/feature.gif\" />";
		String modifiedImageTag = HtmlUtilities.srcInsertURL( imageTag, REPLACEMENT );
		
		assertEquals( "<img src=\"http://www.myplace.com/app/images/feature.gif\" />", modifiedImageTag );

	}
	
	/**
	 * Up one folder
	 */
	public void testReplaceSrc2a()
	{
		String src = "<img src=\"../feature.gif\" />";
		String modifiedImageTag = HtmlUtilities.srcInsertURL( src, REPLACEMENT );
		
		assertEquals( "<img src=\"http://www.myplace.com/feature.gif\" />", modifiedImageTag);
	}
	
	/**
	 * Up, across and down a folder
	 */
	public void testReplaceSrc2b()
	{
		String src = "<img src=\"../images/feature.gif\" />";
		String modifiedImageTag = HtmlUtilities.srcInsertURL( src, REPLACEMENT );
		
		assertEquals( "<img src=\"http://www.myplace.com/images/feature.gif\" />", modifiedImageTag);
	}
	
	/**
	 * Up 2 folders
	 */
	public void testReplaceSrc3()
	{
		String src = "<img src=\"../../feature.gif\" />";
		String modifiedImageTag = HtmlUtilities.srcInsertURL( src, REPLACEMENT + "article/" );
		
		assertEquals( modifiedImageTag, "<img src=\"http://www.myplace.com/feature.gif\" />");
	}
	
	/**
	 * Root folder
	 */
	public void testReplaceSrc4()
	{
		String src = "<img src=\"/feature.gif\" />";
		String modifiedImageTag = HtmlUtilities.srcInsertURL( src, REPLACEMENT );
		
		assertEquals( "<img src=\"http://www.myplace.com/feature.gif\" />", modifiedImageTag );
	}
	
	/**
	 * Same folder, no slash
	 */
	public void testReplaceSrc5()
	{
		String src = "<img src=\"feature.gif\" />";
		String modifiedImageTag = HtmlUtilities.srcInsertURL( src, REPLACEMENT );
		
		assertEquals( "<img src=\"http://www.myplace.com/app/feature.gif\" />", modifiedImageTag);
	}
	
	/**
	 * Full path
	 */
	public void testReplaceSrc6()
	{
		String src = "<img src=\"http://ex-astris-scientia.org/images/feature.gif\" />";
		String modifiedImageTag = HtmlUtilities.srcInsertURL( src, REPLACEMENT );
		
		assertTrue( modifiedImageTag == null );
	}
	
	/**
	 * One dot in path
	 */
	public void testReplaceSrc7()
	{
		String src = "<img src=\"./feature.gif\" />";
		String modifiedImageTag = HtmlUtilities.srcInsertURL( src, REPLACEMENT );
		
		assertEquals( "<img src=\"http://www.myplace.com/app/feature.gif\" />", modifiedImageTag);
	}
	
	/**
	 * Lower folder
	 */
	public void testReplaceHref1()
	{		
		String hrefTag = "<a href=\"articles/feature.html\" />";
		String modifiedHrefTag = HtmlUtilities.hrefInsertURL( hrefTag, REPLACEMENT );
		
		assertEquals( "<a href=\"http://www.myplace.com/app/articles/feature.html\" />", modifiedHrefTag );

	}
	
	/**
	 * Up one folder
	 */
	public void testReplaceHref2a()
	{
		String src = "<a href=\"../feature.html\" />";
		String modifiedHrefTag = HtmlUtilities.hrefInsertURL( src, REPLACEMENT );
		
		assertEquals( "<a href=\"http://www.myplace.com/feature.html\" />", modifiedHrefTag);
	}
	
	/**
	 * Up, across and down a folder
	 */
	public void testReplaceHref2b()
	{
		String src = "<a href=\"../articles/feature.html\" />";
		String modifiedHrefTag = HtmlUtilities.hrefInsertURL( src, REPLACEMENT );
		
		assertEquals( "<a href=\"http://www.myplace.com/articles/feature.html\" />", modifiedHrefTag);
	}
	
	public void testParseUrl()
	{
	     String url = REPLACEMENT + "testPage.htm?param1=x";
	     url = HtmlUtilities.removeUrlParams( url );
	     
	     assertEquals( REPLACEMENT, url );
	}
	
	
	private static final String REPLACEMENT = "http://www.myplace.com/app/";
	
}
