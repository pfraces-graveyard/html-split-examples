// one var to act as the 'current page' counter
var page=1;

// one var to count the total number of characters we need to run through,
// used for indicating load progress
var totalchars = 0;
		
// one var to count the number of processed characters during a run, also for
// indicating load progress
var processedchars = 0;

// one var to indicate 'current line', needed when filling "page" divs
var currentline = 0;

// used to time the loading
var starttime = (new Date()).getTime();

// used to store the content data, while loading
var lines = [];
	
// used to keep the browser responsive. Pauses for ... milliseconds between
// building pages
var waitinterval = 100;

// if load is called with a preset page number, jump to that number once it's
// been generated
var showpage = 1;

/**
 * Reset/initialise all script variables
 */
function reset(newlines)
{
	lines = newlines;
	page = 1;
	totalchars = 0;
	for(i in lines) {
		// html element attribute double prime => double quotes replacement
		lines[i] = lines[i].replace(/ʺ/g,'"');
		totalchars += lines[i].length; }
	processedchars = 0;
	currentline = 0;
	starttime = (new Date()).getTime();
	var content_node = document.getElementById('content');
	while (content_node.childNodes.length>0) {
		content_node.removeChild(content_node.firstChild); }
	resetPageView();
	$('#progress').show();
	$('#slider').slider("option","max",1);
}

/**
  * It's slightly puzzling that javascript itself does not have a "graceful" exit()
  * function for use when things have gone wrong and need to be stopped.
  */
function exit(status)
{
	// notify the user that things just went plain old wrong.
	alert("exit("+status+") called. Halting all execution for page generation");
	// then try to stop graciously, if the browser supports it
	if (window.stop) { window.stop(); }
	// otherwise, force death
	else System.exit();
	// and if that fails, actively break things.
	throw "explicit exit was called, but could not be resolved. Throwing a js error instead.";
}

/**
  * Gets the vertical overflow ratio ['real content' to 'visible content'] for
  * a div, if there is overflow. If there is no overflow, this value will be 1.
  */
function getVerticalOverflow(id)
{
	var obj = document.getElementById(id);
	if(obj.innerHTML.length==0) return 0;
	var overflow = obj.scrollHeight/obj.clientHeight;
	return overflow;
}

/**
  * Gets the horizontal overflow ratio for a div, if there is overflow.
  * If there is no overflow, this value will be 1.
  */
function getHorizontalOverflow(id)
{
	var obj = document.getElementById(id);
	if(obj.innerHTML.length==0) return 0;
	return obj.scrollWidth/obj.clientWidth;
}

// ===========================================================

/**
 * load a file and kickstart everything
 */
function loadFile(file, show_after_generation)
{
	var data = $.ajax({async: false, type:"GET",url:"getfile.php?file="+file}).responseText;
	var newlines = eval("(" + data + ")");
	reset(newlines);
	showpage = show_after_generation;
	tryPage();
	showSet();
}

/**
  * Try to build a page. This function keeps being called until either the hard limit is reached, or
  * we run out of content to fill pages with.
  */			
function tryPage()
{
	// if set to true, this limits the page generation to whichever hardlimit you fill in for pagelimit.
	var limit = false;
	var pagelimit = 10;
	
	// Every time this function is called, we check whether the terminating condition is met:
	if ((limit && page>pagelimit) || currentline >= lines.length) {
		// add a blanco padding for the last page in even-pages "works"
		if(page%2==1 && bookstyle.setsize%2==0) { addPaddingPage(page); }

		// then disable any overflow scrollbars that might be visible
		for(p=1; p<page; p++) { 
			document.getElementById("page"+p).style.overflow = "hidden";
			document.getElementById("page"+p).style.overflowY = "hidden";  }

		// Just for good measure, also report generation time
		var generationtime = (new Date()).getTime() - starttime;
		var seconds = Math.floor(generationtime*10/1000)/10;
		$("#gentime").text(seconds+"s");

		// fade out the loading bar and update the page slider to its final max value
		$("#progress").fadeOut();
		$("#slider").slider({max: (page-1)});
		
		// any post-processing can be done here
		bookStyleDone();
	}

	// if we still have content left to process, do so
	else {
		// add placeholder "zeroth" page
		if(page==1 && bookstyle.setsize%2==0) { addPaddingPage(0); }
		addPage(page); 
		fillPage(page);
	 }
}

/**
  * Sets up a new page for filling, bound to a specific page number.
  * We don't use jQuery for this, because it's too nested an object
  * structure to pass as an html snippet while retaining readability.
  */
function addPage(pagenumber)
{
	// anchor for the page
	var anchor = document.createElement("a");
	anchor.name = "page "+pagenumber;
	
	// master container for this page
	var pageplacer = document.createElement("div");
	pageplacer.id = "pageplacer"+pagenumber;
	pageplacer.setAttribute("class","pageplacer");
	pageplacer.setAttribute("style","position: absolute; top:10px; left: 10px; opacity: 0");

	// offsets regulator
	var pageoffsets = document.createElement("div");
	pageoffsets.id = "offsets"+pagenumber;
	// web 3.7 shadow effect
	pageoffsets.setAttribute("class","offsets dropshadow");

	// page header
	var pageheader = document.createElement("div");
	pageheader.setAttribute("class","pageheader");
	// no header content a.t.m.
	pageheader.innerHTML = "page ("+pagenumber+") header";

	// this is the container that will get the actual page text injected into it
	var page = document.createElement("div");
	page.id = "page"+pagenumber;
	page.setAttribute("class","page");

	// page footer
	var pagefooter = document.createElement("div");
	pagefooter.setAttribute("class","pagefooter");
	// no footer content a.t.m.
	pagefooter.innerHTML = "page ("+pagenumber+") footer";

	// link up the page elements to form a single page
	pageplacer.appendChild(pageoffsets);
	pageoffsets.appendChild(pageheader);
	pageoffsets.appendChild(page);
	pageoffsets.appendChild(pagefooter);

	// then add this completed page to the document
	var content = document.getElementById('content');
	if(content==null) { alert("content div doesn't exist, even though this should be impossible."); }
	else { content.appendChild(anchor); content.appendChild(pageplacer); }
}

/**
 * create a blanco (page without header/content/footer)
 */
function addPaddingPage(pagenumber)
{
	// master container for this page
	var pageplacer = document.createElement("div");
	pageplacer.setAttribute("class","pageplacer");
	pageplacer.id = "pageplacer"+pagenumber;
	
	var pageoffsets = document.createElement("div");
	pageoffsets.setAttribute("class","offsets");
	pageoffsets.id = "offsets"+pagenumber;
	var pageheader = document.createElement("div");
	pageheader.setAttribute("class","pageheader");
	var page = document.createElement("div");
	page.setAttribute("class","page");
	page.id = "page"+pagenumber;
	var pagefooter = document.createElement("div");
	pagefooter.setAttribute("class","pagefooter");

	// link up the page elements to form a single page
	pageplacer.appendChild(pageoffsets);
	pageoffsets.appendChild(pageheader);
	pageoffsets.appendChild(page);
	pageoffsets.appendChild(pagefooter);

	// then add this completed page to the document
	var content = document.getElementById('content');
	if(content==null) { alert("content div doesn't exist, even though this should be impossible."); }
	else { content.appendChild(pageplacer); }

	// blanco pages have no visible style elements
	pageoffsets.style.border="none";
	pageoffsets.style.display="none";	
}

/**
  * Fills a div with id ["page"+pagenumber] with content
  */
function fillPage(pagenumber)
{
	var startline = currentline;

	// first we fill the div until it's overflowing
	while(getVerticalOverflow("page"+pagenumber)<=1 && currentline<=lines.length) {
		var line = lines[currentline++];
		if(!line) continue;
		$("#page"+pagenumber).append(line); }

	// we then remove superfluous linebreaks at the start of the page, and if that's enough
	// to undo the overflow, we try to add some more data
	var killedleading = pruneStartBR(pagenumber);
	while(killedleading && getVerticalOverflow("page"+pagenumber)<=1 && currentline<=lines.length) {
		$("#page"+pagenumber).append(lines[currentline++]); }

	// At this point we have guaranteed overflow, so can we fix this by removing the last line's "<br>"?
	if(pruneEndBR(pagenumber) && getVerticalOverflow("page"+pagenumber)<=1) {
		// we can! we are now done with this page.
		finalisePage(pagenumber);
	}

	// if we couldn't, we're not done yet. Refill the div from scratch up to the line before the one
	// that led to overflow, then try to trickle-feed the page with individual words from the next line.
	else {
		currentline--;
		divstring="";
		for(i=startline; i<currentline; i++) { divstring = divstring + lines[i]; }
		$("#page"+pagenumber).html(divstring); 

		// Remove superfluous linebreaks at the start of the page again
		// (but only if that did anything the first time we tried it)
		if (killedleading) pruneStartBR(pagenumber);

		// since we know the page is now underfilled, try to progressively move data
		// from the next line to the end of this page's last line.
		retroFit(pagenumber); 
	}
}	

// ================================================

/**
 * Helper function.
 *
 * Finds the next sentence break position in a text string, kind of like indexOf, but then more custom.
 * This function will not suggest line breaks inside html elementa, for instance.
 */
function getNextBreak(text, prevbreak)
{
	// used to make sure we don't break up complex html elements
	var inelement = 0;
	var inentity = false;
	for(i=prevbreak; i<text.length;i++) {
		var substr = text.substring(i,i+1);
		if(substr=="<") inelement++;
		else if(substr==">") inelement--;
		else if(substr=="&") inentity=true;
		else if(inentity && substr==";") inentity=false;
		// spaces, semi-colons, colons, full stops, and commas all count as legal break points
		// we could do this with a regexp, but testing shows this makes absolutely zero difference on processing time.
		else if(!inentity && inelement==0 && (substr==" " || substr==":" || substr==";" || substr=="," || substr==".")) return i+1; }
	return -1;
}

/**
 * Helper function.
 *
 * Tries to move data from a line that would cause overflow on a page to the line before it.
 *
 * This operation is a processing bottle-neck: we can improve it by using a divide-and-check 
 * approach instead. But let's not implement that until everything else works nicely, too.
 */
function retroFit(pagenumber)
{
	var div = $("#page"+pagenumber)[0];
	if(currentline<lines.length) 
	{
		var string = lines[currentline];
		var section = "";
		var pos = getNextBreak(string, 0);
		if(pos!=-1) {
			section = string.substring(0,pos);
			string = string.substring(pos);
			// fillDiv is found in the separate filldiv.js
			if(fillDiv("page"+pagenumber, section)) {
				lines[currentline-1] += section;
				lines[currentline] = string;
				setTimeout("retroFit(" + pagenumber + ")", 1); }
			else { finalisePage(pagenumber); }
		}
		else { finalisePage(pagenumber); }
	}
	else { finalisePage(pagenumber); }
}

/**
 * Master function to close off a page before moving on to the next one
 */
function finalisePage(pagenumber)
{
	// First, hide the content
	$("#offsets"+pagenumber).hide(); 

	// Then, tell the placer where to actually sit on the page, and set its opacity to 1. Because
	// we just hid the offsets page, this will change absolutely nothing visually, but it prevents
	// the flicker that you get with create-visibly-and-hide. Very useful.
	var pp = document.getElementById("pageplacer"+pagenumber);
	pp.style.position = "relative";
	pp.style.top = "0px";
	pp.style.left = "0px";
	pp.style.opacity = "1.0";
	
	// Update the progress indicator, too:
	processedchars += $("#page"+page).text().length;
	var perc = 100 * processedchars / totalchars;
	$("#progress").progressbar({value: perc});
	$("#perc").text(Math.ceil(perc)+"%");
	
	// Also make sure to increment the page count and
	// "total pages" number on the web page
	page++;
	if(page-1==showpage) { showPage(showpage); }
	else { showSet(); }
	
	// Finally, schedule the next tryPage() call
	setTimeout("tryPage()", 1);
}

/**
 * Helper function
 *
 * Removes superfluous <br> codes at the start of a page
 */		
function pruneStartBR(pagenumber)
{
	// kill <br> codes at the start of this new page's text
	var killedlines = false;
	var string = $("#page"+pagenumber).html();
	var ts = string.length;
	string = string.replace(/^(\s*　*\<br\>)+/, "");
	if(ts != string.length) { killedlines = true; }
	if(killedlines)  { $("#page"+pagenumber).html(string); }
	return killedlines;
}

/**
 * Helper function
 *
 * Replaces multiple <br> at the end of a page with a single <br>
 */		
function pruneEndBR(pagenumber)
{
	// kill <br> codes at the end of this page's text
	var killedlines = false;
	var string = $("#page"+pagenumber).html();
	var ts = string.length;
	string = string.replace(/(\s*　*\<br\>\s*　*)+$/, "");
	if(ts != string.length) { killedlines = true; }
	if(killedlines) { $("#page"+pagenumber).html(string); }
	return killedlines;
}

// ================================================================

/**
 * Our administrative object
 */
var bookstyle = {
	css_unit: "cm",
	offset_padding: "0.5",
	page_width: "13",
	page_height: "15",
	currentset: -1,
	setsize: 2,
	topdiv: "offsets"};

/**
 * update the CSS for page dimensions.
 */
function updateCSS(offset, width, height, unit) {
	// update the "bookstyle" administrative object
	bookstyle.css_unit = unit;
	bookstyle.offset_padding = offset;
	bookstyle.page_width = width;
	bookstyle.page_height = height;
	// update the CSS rules
	changeRule(".offsets", "padding", offset + unit);
	changeRule(".page", "width", width + unit);
	changeRule(".page", "height", height + unit);
	// update the values on-page
	$("#bookstyle_css_offset").val(offset);
	$("#bookstyle_css_page_width").val(width);
	$("#bookstyle_css_page_height").val(height); 
}

/**
 * We can't rely on jQuery to modify CSS rules, because jQuery 
 * can only modify CSS that is being used on-page by some HTML
 * element, and we may want to change the rules before any such
 * elements exist. So, instead, some custom JS for CSS manipulation
 */
function changeRule(selector, property, value) {
	for(s in document.styleSheets) {
		// get the CSS rules for a stylesheet
		if (document.styleSheets[s].cssRules) {
			var css = document.styleSheets[s].cssRules; }
		else if (document.styleSheets[s].rules) {
			var css = document.styleSheets[s].rules; }
		// if it contains the passed rule, modify it
		for(rule in css) {
			if(css[rule].selectorText===selector) {
				css[rule].style[property] = value; }}}}

/**
 * View the previous set of pages
 */
function viewPreviousSet() {
	hideSet();
	bookstyle.currentset--;
	showSet(); }

/**
 * View the next set of pages
 */
function viewNextSet() {
	hideSet();
	bookstyle.currentset++;
	showSet(); }

/**
 * hide the "current" page set
 */
function hideSet() {
	for(i=0; i<bookstyle.setsize; i++) {
			var pagenumber = bookstyle.currentset*bookstyle.setsize + i;
			$("#"+ bookstyle.topdiv + pagenumber).css("margin", "0px");
			$("#"+ bookstyle.topdiv + pagenumber).hide(); }}

/**
 * show the "current" page set
 */
function showSet() {
	var setstring = "";
	for(i=0; i<bookstyle.setsize; i++) {
			var pagenumber = bookstyle.currentset*bookstyle.setsize + i;
			$("#"+ bookstyle.topdiv + pagenumber).css("margin", "0.5cm");
			$("#"+ bookstyle.topdiv + pagenumber).show(); 
			setstring += pagenumber + (i<bookstyle.setsize-1? "/" : ""); }
	if(bookstyle.currentset==0) { $("#prev").button("disable"); } else { $("#prev").button("enable"); } 
	if((bookstyle.currentset*bookstyle.setsize)+1>=page-1) { $("#next").button("disable"); } else { $("#next").button("enable"); } 
	$("#curpage").text("current pages: " + setstring +  " of " + (page-1));
	$("#slider").slider("value", bookstyle.currentset*bookstyle.setsize); }

/**
 * spawn the dialog box that lets us pick a page
 */
function jumpToPage(page) {
	// code goes here
}

/**
 * Show a particular page
 */
function showPage(pagenumber) {
	hideSet();
	bookstyle.currentset = Math.floor(pagenumber/bookstyle.setsize);
	showSet(); }

/**
 * Reset the page view to the first page
 */
function resetPageView() {
	hideSet();
	bookstyle.currentset = 0;
	showSet();
}

