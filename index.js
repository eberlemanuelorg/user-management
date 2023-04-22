const core = require('@actions/core');

core.summary
    .addHeading('Build summary')
    .addRaw('this is a description of the build')
    .addTable([
        [{data: 'Test', header: true}, {data: 'Result', header: true}],
        ['a1', 'Pass'],
        ['a2', 'Failed']])
    .addList(['<a href="http://example.com/" title="Title">an example</a>'])
    .addLink('View staging deployment!', 'https://github.com')
    .write()