public with sharing class FlowRunLogger {
    public class LogRequest {
        @InvocableVariable(required=true)
        public String flowApiName;

        @InvocableVariable
        public String flowLabel;

        @InvocableVariable
        public Integer flowVersion;

        @InvocableVariable
        public String interviewGuid;

        @InvocableVariable(required=true)
        public String status; // 'Success' or 'Fault'

        @InvocableVariable
        public String entryPoint; // Screen, RecordTriggered, Autolaunched, Subflow, Other

        @InvocableVariable
        public Datetime startTime;

        @InvocableVariable
        public Datetime endTime;

        @InvocableVariable
        public Long durationMs;

        @InvocableVariable
        public String recordId;

        @InvocableVariable
        public String errorMessage;

        @InvocableVariable
        public String errorType;

        @InvocableVariable
        public Id runAsUserId;
    }

    @InvocableMethod(label='Log Flow Run' description='Logs a Flow run (success or fault) to Flow_Run__c')
    public static void logRuns(List<LogRequest> requests) {
        if (requests == null || requests.isEmpty()) return;

        List<Flow_Run__c> rows = new List<Flow_Run__c>();

        for (LogRequest r : requests) {
            if (r == null) continue;

            Flow_Run__c fr = new Flow_Run__c();
            fr.FlowApiName__c = r.flowApiName;
            fr.FlowLabel__c = r.flowLabel;
            fr.FlowVersion__c = r.flowVersion;
            fr.InterviewGuid__c = r.interviewGuid;
            fr.Status__c = r.status;
            fr.EntryPoint__c = r.entryPoint;
            fr.StartTime__c = r.startTime;
            fr.EndTime__c = r.endTime;
            fr.DurationMs__c = (r.durationMs == null && r.startTime != null && r.endTime != null)
                ? (r.endTime.getTime() - r.startTime.getTime())
                : r.durationMs;

            fr.RecordId__c = r.recordId;
            fr.ErrorMessage__c = r.errorMessage;
            fr.ErrorType__c = r.errorType;
            fr.RunAsUserId__c = (r.runAsUserId == null) ? UserInfo.getUserId() : r.runAsUserId;

            // Snapshot platform limits as of this invocable execution (best-effort)
            fr.CpuTimeMs__c = Limits.getCpuTime();
            fr.SoqlQueries__c = Limits.getQueries();
            fr.DmlStatements__c = Limits.getDmlStatements();

            rows.add(fr);
        }

        if (!rows.isEmpty()) {
            insert rows;
        }
    }
}