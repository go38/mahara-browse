{include file="header.tpl"}
{$items.pagination|safe}
<div id="browse-container" class="clearfix">
    <div id="browse-options" class="contentlinks">

        <div id="select-filters" class="select-filters fr">
<!--  The following sections are left in as reference for anyone wishing to implement filtering by college, etc. -->
<!--
            <div id="filter-tabs" class="fr">
            <div id="filter-college-container" class="chzn-container filter-section">
                <select data-placeholder="College" id="filter-college" class="filter-section chzn-select">
                    <option value=""></option>
                    {foreach from=$colleges item=item name=college}
                        <option value="{$dwoo.foreach.college.index + 1}">
                            {$item}
                        </option>
                    {/foreach}
                </select>
            </div>

            <div id="filter-course-activate-container" class="chzn-container filter-section">
                <div id="activate-course-search" class="chzn-container-single chzn-default">
                    <a class="chzn-single chzn-default" href="javascript:void(0)"><span>Course</span>
                    <div><b></b></div>
                    </a>
                </div>
            </div>
            </div>
--><!-- filter-tabs -->
            <div id="filter-keyword-container" class="filter-section fl">
                <label for="filter-keyword">Search</label>
                <select id="search-type" style="" name="searchtype">
                <option selected="selected" value="user">User</option>
                <option value="pagetitle">Page title</option>
                <option value="pagetag">Page tag</option>
                </select>
                <input type="text" placeholder="Type name" value="" maxlength="250" tabindex="1" size="20" name="keyword" id="filter-keyword" class="text fl">
                <button id="query-button-keyword" class="add-text-filter-button fl" type="submit" value="keyword">{str tag="go"}</button>
            </div>

        </div><!-- select-filters -->
    </div><!-- browse-options -->
</div>

<div id="browsewrap">
    <div class="remove-filter hidden" id="filter-remove-filter-entry-container">
        <input type="button" class="remove-filter-button ui-icon ui-state-default ui-icon-circle-close">
    </div>

<div id="filter-course-container">
    <div id="filter-course-wrapper">
            <label for="filter-course" class="fl">Course name or ID</label>
            <input type="text" value="" maxlength="250" tabindex="12" size="12" name="course" id="filter-course" class="text fl">
            <button id="query-button-course" class="add-text-filter-button fl" type="submit" value="course">{str tag="go"}</button>
    </div>
</div>
<div id="active-filters-container">
    <div id="active-filters" class="clearfix"></div>
</div>
    <div id="browselist" class="fullwidth listing clearfix">
    {$items.tablerows|safe}
    </div>
</div>
{include file="footer.tpl"}

