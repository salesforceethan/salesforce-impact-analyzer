@IsTest
private class FlowRunLoggerTest {
    @IsTest
    static void testLogRuns_success() {
        FlowRunLogger.LogRequest req = new FlowRunLogger.LogRequest();
        req.flowApiName = 'My_Test_Flow';
        req.flowLabel = 'My Test Flow';
        req.flowVersion = 1;
        req.interviewGuid = '12345-ABCDE';
        req.status = 'Success';
        req.entryPoint = 'Screen';
        req.startTime = System.now().addSeconds(-2);
        req.endTime = System.now();
        req.recordId = '001000000000001AAA';
        req.runAsUserId = UserInfo.getUserId();

        Test.startTest();
        FlowRunLogger.logRuns(new List<FlowRunLogger.LogRequest>{ req });
        Test.stopTest();

        List<Flow_Run__c> rows = [
            SELECT FlowApiName__c, Status__c, DurationMs__c, RunAsUserId__c
            FROM Flow_Run__c
            WHERE FlowApiName__c = 'My_Test_Flow'
        ];
        System.assertEquals(1, rows.size());
        System.assertEquals('Success', rows[0].Status__c);
        System.assertNotEquals(null, rows[0].DurationMs__c);
    }

    @IsTest
    static void testLogRuns_fault() {
        FlowRunLogger.LogRequest req = new FlowRunLogger.LogRequest();
        req.flowApiName = 'My_Test_Flow';
        req.status = 'Fault';
        req.errorMessage = 'Boom';
        req.errorType = 'DmlException';

        Test.startTest();
        FlowRunLogger.logRuns(new List<FlowRunLogger.LogRequest>{ req });
        Test.stopTest();

        List<Flow_Run__c> rows = [
            SELECT Status__c, ErrorMessage__c, ErrorType__c
            FROM Flow_Run__c
            WHERE Status__c = 'Fault'
            ORDER BY CreatedDate DESC
            LIMIT 1
        ];
        System.assertEquals('Boom', rows[0].ErrorMessage__c);
        System.assertEquals('DmlException', rows[0].ErrorType__c);
    }
}
