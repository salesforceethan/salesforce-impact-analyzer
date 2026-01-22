global class LeadProcessor implements Database.Batchable<SObject> {

    global Database.QueryLocator start(Database.BatchableContext bc) {
        // Collect all Leads in the org
        return Database.getQueryLocator([
            SELECT Id, LeadSource
            FROM Lead
        ]);
    }

    global void execute(Database.BatchableContext bc, List<SObject> scope) {
        List<Lead> leadsToUpdate = new List<Lead>();

        for (SObject s : scope) {
            Lead l = (Lead) s;
            l.LeadSource = 'Dreamforce';
            leadsToUpdate.add(l);
        }

        if (!leadsToUpdate.isEmpty()) {
            update leadsToUpdate;
        }
    }

    global void finish(Database.BatchableContext bc) {
        // Not required for this challenge, but included for completeness
    }
}