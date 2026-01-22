/**
 * Flow Monitor Dashboard (MVP)
 * - Uses mock data initially; wire to Apex later
 * - Filters: date range, flow api name, release tag
 */
import { LightningElement, track } from 'lwc';

export default class FlowMonitorDashboard extends LightningElement {
    // Filters
    @track startDateStr;
    @track endDateStr;
    @track flowApiName = '';
    @track releaseTag = '';

    // Data (mock for MVP)
    @track topFailures = [];
    @track slowFlows = [];
    @track limitsHeatmap = [];
    @track regressions = [];

    connectedCallback() {
        // Default to last 7 days
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 6);
        this.startDateStr = this.toDateInput(start);
        this.endDateStr = this.toDateInput(today);

        // Seed mock data
        this.seedMock();
    }

    handleStartDate(e) {
        this.startDateStr = e.target.value;
    }
    handleEndDate(e) {
        this.endDateStr = e.target.value;
    }
    handleFlowApiName(e) {
        this.flowApiName = e.target.value;
    }
    handleReleaseTag(e) {
        this.releaseTag = e.target.value;
    }

    handleRefresh() {
        // For MVP, just reseed mock filtered by flowApiName if provided
        this.seedMock();
        if (this.flowApiName) {
            const match = (n) => (n || '').toLowerCase().includes(this.flowApiName.toLowerCase());
            this.topFailures = this.topFailures.filter(r => match(r.flowApiName));
            this.slowFlows = this.slowFlows.filter(r => match(r.flowApiName));
            this.limitsHeatmap = this.limitsHeatmap.filter(r => match(r.flowApiName));
            this.regressions = this.regressions.filter(r => match(r.flowApiName));
        }
    }

    toDateInput(d) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // Mock data for UI scaffolding
    seedMock() {
        this.topFailures = [
            { key: 'a', flowApiName: 'Case_AutoAssign', version: 12, failCount: 37, failRatePct: 12.5 },
            { key: 'b', flowApiName: 'Lead_Intake', version: 5, failCount: 21, failRatePct: 6.8 },
            { key: 'c', flowApiName: 'Order_Submit', version: 3, failCount: 11, failRatePct: 4.2 }
        ];
        this.slowFlows = [
            { key: 'd', flowApiName: 'Opportunity_Qualification', version: 18, p95Ms: 2850, avgMs: 980 },
            { key: 'e', flowApiName: 'Case_Close', version: 9, p95Ms: 2100, avgMs: 750 },
            { key: 'f', flowApiName: 'Order_Submit', version: 3, p95Ms: 3950, avgMs: 1200 }
        ];
        this.limitsHeatmap = [
            { key: 'g', flowApiName: 'Order_Submit', version: 3, cpuHigh: 6, soqlHigh: 4, dmlHigh: 2 },
            { key: 'h', flowApiName: 'Case_AutoAssign', version: 12, cpuHigh: 2, soqlHigh: 9, dmlHigh: 1 },
            { key: 'i', flowApiName: 'Lead_Intake', version: 5, cpuHigh: 0, soqlHigh: 3, dmlHigh: 5 }
        ];
        this.regressions = [
            { key: 'j', flowApiName: 'Order_Submit', releaseTag: '2026.01', deltaP95Ms: 600, deltaFailRatePct: 2.3 },
            { key: 'k', flowApiName: 'Case_AutoAssign', releaseTag: '2026.01', deltaP95Ms: 120, deltaFailRatePct: 0.8 }
        ];
    }
}
