/* 
 * The MIT License
 *
 * Copyright 2016 Eli Davis.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */


var seCourses = [
    {
        "id": "CSE-1002",
        "name": "Intro CSE",
        "completed": true,
        "hours": 2,
        "lab": false
    },
    {
        "id": "CSE-1284",
        "name": "Intro Comp Prog",
        "completed": true,
        "hours": 4,
        "lab": true
    },
    {
        "id": "CSE-1384",
        "name": "Intermed Comp Prog",
        "completed": true,
        "prereq": [{"CSE-1284": "C"}],
        "hours": 4,
        "lab": true
    },
    {
        "id": "CSE-2383",
        "name": "Data Struc & Anal of Alg",
        "completed": true,
        "prereq": [{"CSE-1384": "C"}],
        "hours": 3,
        "lab": true
    },
    {
        "id": "CSE-2813",
        "name": "Discrete Structures",
        "completed": true,
        "prereq": [{"CSE-1284": "C"}],
        "hours": 3,
        "lab": true
    },
    {
        "id": "CSE-3324",
        "name": "Dist Client/Server Prog",
        "completed": true,
        "prereq": [{"CSE-2383": "C"}],
        "hours": 4,
        "lab": true
    },
    {
        "id": "CSE-4214",
        "name": "Intro to Software Eng",
        "completed": true,
        "prereq": [{"CSE-2383": "C"}],
        "hours": 4,
        "lab": true
    },
    {
        "id": "ECE-3714",
        "name": "Digital Devices",
        "completed": true,
        "prereq": [{"CSE-1284": "C"}],
        "hours": 4,
        "lab": true
    },
    {
        "id": "ECE-3724",
        "name": "Microprocessors",
        "completed": true,
        "prereq": [{"CSE-1284": "C"}],
        "hours": 4,
        "lab": true
    },
    {
        "id": "CSE-3213",
        "name": "Software Eng Sr Project I",
        "completed": false,
        "prereq": [{"CSE-4214": "C"}],
        "hours": 3,
        "lab": true
    },
    {
        "id": "CSE-3223",
        "name": "Software Eng Sr Project II",
        "completed": false,
        "prereq": [{"CSE-4214": "C"}],
        "hours": 3,
        "lab": true
    },
    {
        "id": "CSE-3981",
        "name": "Computer Ethics",
        "completed": false,
        "prereq": ["Senior standing"],
        "hours": 1,
        "lab": false
    },
    {
        "id": "CSE-4153",
        "name": "Data Comm Networks",
        "completed": false,
        "prereq": [{"CSE-1384": "C"}],
        "hours": 3,
        "lab": false
    },
    {
        "id": "CSE-4233",
        "name": "SW Arch & Design",
        "completed": false,
        "prereq": [{"CSE-4214": "C"}],
        "hours": 3,
        "lab": false
    },
    {
        "id": "CSE-4283",
        "name": "Software Testing and QA",
        "completed": false,
        "prereq": [{"CSE-4214": "C"}],
        "hours": 3,
        "lab": false
    },
    {
        "id": "CSE-4503",
        "name": "Database Management Systems",
        "completed": false,
        "prereq": [{"CSE-2383": "C"}, {"CSE-2813": "C"}],
        "hours": 3,
        "lab": false
    },
    {
        "id": "CSE-4733",
        "name": "Operating Systems I",
        "completed": false,
        "prereq": [{"CSE-2383": "C"}, {"ECE-3724": "C"}],
        "hours": 3,
        "lab": false
    },
    {
        "id": "CSE-4833",
        "name": "Intro to Algorithms",
        "completed": false,
        "prereq": [{"CSE-2383": "C"}, {"CSE-2813": "C"}],
        "hours": 3,
        "lab": false
    }
];