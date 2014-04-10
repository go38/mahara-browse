<?php
/**
 * Mahara: Electronic portfolio, weblog, resume builder and social networking
 * Copyright (C) 2006-2009 Catalyst IT Ltd and others; see:
 *                         http://wiki.mahara.org/Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @package    mahara
 * @subpackage artefact-browse
 * @author     Mike Kelly UAL m.f.kelly@arts.ac.uk / Catalyst IT Ltd
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL
 *
 */

define('INTERNAL', 1);
define('JSON', 1);
define('PUBLIC', 1);

require(dirname(dirname(dirname(__FILE__))) . '/init.php');
safe_require('artefact', 'browseprofiles');
$field = param_alpha('field', '');
$term = param_variable('term', '');
if (isset($field) && isset($term)) {
    $querytype = $field;
    $queryterm = $term;
}

$result = array();
$localenrolments = get_records_sql_array("SELECT DISTINCT course FROM usr_enrolment WHERE course != 'none'", array());
$localcourseids = array();
if ($localenrolments) {
    foreach ($localenrolments as $row) {
        $allcourses = explode(',', $row->course);
        foreach ($allcourses as $course) {
            if (!in_array($course, $localcourseids) && strlen($course)) {
                $localcourseids[] = $course;
            }
        }
    }
}

switch ($querytype) {
    case 'course':

        try {
            $databasetype = get_config('extdbtype');
            $server = get_config('extdbhost');
            $user = get_config('extdbuser');
            $password = get_config('extdbpass');
            $database = get_config('extdbname');
            $dbext = ADONewConnection($databasetype);
            $dbext->debug = false;
            $dbext->Connect($server, $user, $password, $database);
            $rs = $dbext->Execute('SELECT courseid, coursename
                                   FROM (
                                       SELECT COURSEID as courseid, FULL_DESCRIPTION AS coursename
                                       FROM COURSES
                                       WHERE COURSEID LIKE ?
                                       OR FULL_DESCRIPTION LIKE ?
                                       GROUP BY COURSEID
                                    UNION ALL
                                       SELECT COURSEID as courseid, FULL_DESCRIPTION AS coursename
                                       FROM new_courses
                                       WHERE COURSEID LIKE ?
                                       OR FULL_DESCRIPTION LIKE ?
                                       GROUP BY COURSEID
                                    ) t
                                    GROUP BY courseid',
                                   array('%' . $queryterm . '%', '%' . $queryterm . '%', '%' . $queryterm . '%', '%' . $queryterm . '%'));
            $ids = array();
            while ($row = $rs->FetchNextObject()) {
                $posname = strpos(strtolower($row->COURSENAME), strtolower($queryterm));
                $posid = strpos(strtolower($row->COURSEID), strtolower($queryterm));
                if ($posname !== false && in_array($row->COURSEID, $localcourseids)) {
                    $result['courses'][] = $row->COURSENAME;
                }
                else if ($posid !== false && in_array($row->COURSEID, $localcourseids)) {
                    $result['courses'][] = $row->COURSEID;
                }
            }
            $dbext->Close();
        } catch (Exception $e) {
            if (!empty($dbext)) {
                $dbext->Close();
            }
            log_warn("Exception thrown trying to retrieve course and college in browse plugin: " . $e);
        }

        $result['error'] = false;
        $result['message'] = false;
        break;
    case 'courseid':
        $courseids = array();
        try {
            $databasetype = get_config('extdbtype');
            $server = get_config('extdbhost');
            $user = get_config('extdbuser');
            $password = get_config('extdbpass');
            $database = get_config('extdbname');
            $dbext = ADONewConnection($databasetype);
            $dbext->debug = false;
            $dbext->Connect($server, $user, $password, $database);
            $rs = $dbext->Execute('SELECT courseid
                                   FROM (
                                       SELECT COURSEID as courseid
                                       FROM COURSES
                                       WHERE COURSEID LIKE ?
                                       OR FULL_DESCRIPTION LIKE ?
                                       GROUP BY COURSEID
                                    UNION ALL
                                       SELECT COURSEID as courseid
                                       FROM new_courses
                                       WHERE COURSEID LIKE ?
                                       OR FULL_DESCRIPTION LIKE ?
                                       GROUP BY COURSEID
                                    ) t
                                    GROUP BY courseid',
                                   array('%' . $queryterm . '%', '%' . $queryterm . '%', '%' . $queryterm . '%', '%' . $queryterm . '%'));
            while ($row = $rs->FetchNextObject()) {
                if (in_array($row->COURSEID, $localcourseids)) {
                    $courseids[] = $row->COURSEID;
                }
            }
            $dbext->Close();
        } catch (Exception $e) {
            if (!empty($dbext)) {
                $dbext->Close();
            }
            log_warn("Exception thrown trying to retrieve courseid in browseskillshare: " . $e);
        }

        $result['courseid'] = implode(",", $courseids);
        $result['error'] = false;
        $result['message'] = false;
        break;
}

json_headers();
echo json_encode($result);
