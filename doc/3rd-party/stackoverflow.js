/**
 * Normally, you can compare the client[Height|Width] with scroll[Height|Width]
 * in order to detect this... but they'll be the same when overflow is visible.
 * So a detection routine must account for this
 *
 * Tested in FF3, IE6, Chrome 0.2.149.30.
 *
 * Determines if the passed element is overflowing its bounds,
 * either vertically or horizontally.
 * Will temporarily modify the "overflow" style to detect this
 * if necessary.
 */
function checkOverflow(el)
{
   var curOverflow = el.style.overflow;
   if ( !curOverflow || curOverflow === "visible" )
      el.style.overflow = "hidden";

   var isOverflowing = el.clientWidth < el.scrollWidth 
      || el.clientHeight < el.scrollHeight;

   el.style.overflow = curOverflow;

   return isOverflowing;
}
