$(window).load(function () {
    $(function () {
        $('.tree li.parent > div').on('click', function (e) {
            var children = $(this).parent('li.parent').find(' > ul > li');
            if (children.is(":visible")) {
                children.hide('fast');
                $(this).find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
            } else {
                children.show('fast');
                $(this).find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
            }
            e.stopPropagation();
        });
    });
});

String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};

renderTree = function (testSuite) {
    appendToNode = function (parentNode, data, isLeaf, visible) {
        var node = null;
        if (isLeaf) {
            // an empty test fixture
            if (data.hasOwnProperty('isEmpty') && data.isEmpty) {
                return node;
            }
            var nodeContent = '<li class="node leaf"><div class="name">{name}</div></li>';
            if (data.hasOwnProperty("fixtureType")) {
                // test fixture
                node = $(nodeContent.format({"name": '@' + data.fixtureType}));
            } else {
                // test case
                node = $(nodeContent.format({"name": data.name}));
            }
        }
        else {
            // test container
            var nodeContent = '<li class="node parent"><div class="pass-rate" style="width: {passRate}%"></div><div><span>&gt;</span><span class="name">{name}</span><span class="total">{total}</span><span class="passed">{passed}</span><span class="failed">{failed}</span><span class="skipped">{skipped}</span></div><ul></ul></li>';
            node = $(nodeContent.format({
                "passRate": data.passRate,
                "name": data.name,
                "total": data.statusCount.total,
                "passed": data.statusCount.passed,
                "failed": data.statusCount.failed,
                "skipped": data.statusCount.skipped
            }));
        }
        if (!visible) {
            node.css('display', 'none');
        }
        parentNode.find(' > ul').append(node);
        return node;
    };

    var testSuiteNode = appendToNode($('.tree'), testSuite, false, true);

    appendToNode(testSuiteNode, testSuite.beforeSuite, true, true);

    for (var i = 0; i < testSuite.testClasses.length; i++) {
        var testClass = testSuite.testClasses[i];
        var testClassNode = appendToNode(testSuiteNode, testClass, false, true);

        appendToNode(testClassNode, testClass.beforeClass, true, false);

        for (var j = 0; j < testClass.testGroups.length; j++) {
            var testGroup = testClass.testGroups[j];
            var testGroupNode = appendToNode(testClassNode, testGroup, false, false);

            appendToNode(testGroupNode, testGroup.beforeGroup, true, false);

            for (var k = 0; k < testGroup.testCases.length; k++) {
                var testCase = testGroup.testCases[k];
                appendToNode(testGroupNode, testCase, true, false);
            }

            appendToNode(testGroupNode, testGroup.afterGroup, true, false);
        }

        appendToNode(testClassNode, testClass.afterClass, true, false);
    }

    appendToNode(testSuiteNode, testSuite.afterSuite, true, true);
};

renderTestFixturePanel = function (detailPanel, data) {
    var testFixturePanel = $('<div class="test-fixture"><table></table></div>');
    var fieldSlot = testFixturePanel.find(' > table');

    var fixtureType = $('<tr class="{0}"><th>@{1}</th></tr>'.format(data.status, data.fixtureType));
    fieldSlot.append(fixtureType);
    var name = $('<tr><td>Name</td><td>{0}</td></tr>'.format(data.name));
    fieldSlot.append(name);
    var fullName = $('<tr><td>Full Name</td><td>{0}</td></tr>'.format(data.fullName));
    fieldSlot.append(fullName);
    var description = $('<tr><td>Description</td><td>{0}</td></tr>'.format(data.description));
    fieldSlot.append(description);
    var startTime = $('<tr><td>Start Time</td><td>{0}</td></tr>'.format(data.startTime));
    fieldSlot.append(startTime);
    var endTime = $('<tr><td>End Time</td><td>{0}</td></tr>'.format(data.endTime));
    fieldSlot.append(endTime);
    var duration = $('<tr><td>Duration</td><td>{0}s</td></tr>'.format(data.elapsedTime));
    fieldSlot.append(duration);
    var logs = $('<tr><td>Logs</td><td class="logs"></td></tr>');
    fieldSlot.append(logs);
    var logSlot = logs.find('.logs');
    for (var i = 0; i < data.logs.length; i++) {
        var level = data.logs[i].level;
        var message = data.logs[i].message;
        var log = $('<span class="log-level">[{0}]</span><span class="{0}">{1}</span><br/>'.format(level, message));
        logSlot.append(log);
    }
    if (data.screenshot != null) {
        var screenshot = $('<tr><td>Screenshot</td><td><a href="{0}" target="_blank"><img class="screenshot" src="{0}" /></a></td></tr>'.format(data.screenshot));
        fieldSlot.append(screenshot);
    }

    detailPanel.append(testFixturePanel);
};

renderDetailPanel = function (data) {
    var detailPanel = $('.detail-panel');
    detailPanel.empty();
    if (data.hasOwnProperty('isEmpty')) {
        renderTestFixturePanel(detailPanel, data);
    } else {
        if (!data.beforeMethod.isEmpty) {
            renderTestFixturePanel(detailPanel, data.beforeMethod);
        }
        renderTestFixturePanel(detailPanel, data.test);
        if (!data.afterMethod.isEmpty) {
            renderTestFixturePanel(detailPanel, data.afterMethod);
        }
    }
};