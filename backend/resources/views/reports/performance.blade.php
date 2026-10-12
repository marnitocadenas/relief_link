<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>ReliefLink Performance Report</title>
    <style>
        @page { margin: 32px 36px; }
        body { color: #1f2937; font-family: DejaVu Sans, sans-serif; font-size: 10px; }
        h1 { color: #17365d; font-size: 23px; margin: 0 0 5px; }
        h2 { color: #17365d; font-size: 14px; margin: 22px 0 8px; }
        p { color: #52647a; margin: 4px 0; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; }
        .period { color: #2563eb; font-size: 11px; font-weight: bold; text-transform: capitalize; }
        .metrics { border-collapse: separate; border-spacing: 7px; margin: 10px -7px; width: 100%; }
        .metrics td { background: #f1f5fb; border: 1px solid #d8e2f0; padding: 10px; width: 33%; }
        .label { color: #64748b; font-size: 8px; font-weight: bold; text-transform: uppercase; }
        .value { color: #17365d; font-size: 16px; font-weight: bold; margin-top: 5px; }
        table.data { border-collapse: collapse; width: 100%; }
        .data th { background: #17365d; color: #fff; font-size: 9px; padding: 7px 6px; text-align: left; }
        .data td { border-bottom: 1px solid #d8e2f0; padding: 7px 6px; }
        .data tr:nth-child(even) td { background: #f7f9fc; }
        .number { text-align: right !important; }
        .footer { color: #64748b; font-size: 8px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ReliefLink Performance Report</h1>
        <p class="period">Reporting period: {{ str_replace('_', ' ', $report['period']) }}</p>
        <p>Generated {{ now()->format('F j, Y g:i A') }}</p>
    </div>

    <h2>Executive Performance Summary</h2>
    <table class="metrics">
        <tr>
            <td><div class="label">Request approval rate</div><div class="value">{{ $report['approval_rate'] }}%</div></td>
            <td><div class="label">Match confirmation rate</div><div class="value">{{ $report['confirmation_rate'] }}%</div></td>
            <td><div class="label">Active donors</div><div class="value">{{ number_format($report['coverage']['active_donors']) }}</div></td>
        </tr>
        <tr>
            <td><div class="label">Active beneficiaries</div><div class="value">{{ number_format($report['coverage']['active_beneficiaries']) }}</div></td>
            <td><div class="label">Fulfilled donations</div><div class="value">{{ number_format($report['coverage']['fulfilled_donations']) }}</div></td>
            <td><div class="label">Fulfilled requests</div><div class="value">{{ number_format($report['coverage']['fulfilled_requests']) }}</div></td>
        </tr>
    </table>

    <h2>Financial Assistance</h2>
    <table class="data">
        <thead><tr><th>Metric</th><th class="number">Value (PHP)</th></tr></thead>
        <tbody>
            <tr><td>Financial requests</td><td class="number">{{ number_format($report['coverage']['financial_requests']) }}</td></tr>
            <tr><td>Amount requested</td><td class="number">{{ number_format($report['coverage']['financial_amount_requested'], 2) }}</td></tr>
            <tr><td>Amount fulfilled</td><td class="number">{{ number_format($report['coverage']['financial_amount_fulfilled'], 2) }}</td></tr>
        </tbody>
    </table>

    <h2>Category Balance &amp; Distribution</h2>
    <table class="data">
        <thead>
            <tr><th>Category</th><th class="number">Donated</th><th class="number">Requested</th><th class="number">Balance</th><th class="number">Fulfilled</th><th class="number">Coverage</th></tr>
        </thead>
        <tbody>
            @forelse ($report['category_balance'] as $row)
                @php
                    $requested = (int) $row['requested_quantity'];
                    $fulfilled = (int) $row['fulfilled_quantity'];
                    $coverage = $requested > 0 ? min(100, (int) round($fulfilled / $requested * 100)) : 0;
                @endphp
                <tr>
                    <td>{{ ucwords(str_replace('_', ' ', $row['category'])) }}</td>
                    <td class="number">{{ number_format($row['donated_quantity']) }}</td>
                    <td class="number">{{ number_format($requested) }}</td>
                    <td class="number">{{ number_format($row['donated_quantity'] - $requested) }}</td>
                    <td class="number">{{ number_format($fulfilled) }}</td>
                    <td class="number">{{ $coverage }}%</td>
                </tr>
            @empty
                <tr><td colspan="6">No category data was recorded for this period.</td></tr>
            @endforelse
        </tbody>
    </table>

    <p class="footer">Report data is calculated from ReliefLink records for the selected reporting period.</p>
</body>
</html>
