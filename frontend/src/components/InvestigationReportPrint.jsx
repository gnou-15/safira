import React from 'react';

// Helper to format risk index badge background styling dynamically for print
const getRiskIndexStyle = (indexStr) => {
  if (!indexStr) return {};
  const lower = indexStr.toLowerCase();
  if (lower.includes('low')) {
    return { backgroundColor: '#22c55e', color: '#ffffff' };
  } else if (lower.includes('medium') || lower.includes('moderate')) {
    return { backgroundColor: '#eab308', color: '#ffffff' };
  } else if (lower.includes('high')) {
    return { backgroundColor: '#f97316', color: '#ffffff' };
  } else if (lower.includes('extreme') || lower.includes('critical')) {
    return { backgroundColor: '#ef4444', color: '#ffffff' };
  }
  return { backgroundColor: '#f1f5f9', color: '#3b1c14' };
};

export default function InvestigationReportPrint({ currentInvestigation }) {
  if (!currentInvestigation) return null;

  const rawTitle = currentInvestigation.title || 'Aircraft Parking Position Deviation During Marshalling Operations of Flight EK338';
  const cleanTitle = rawTitle.replace(/^(investigation\s+report:\s*)+/i, '').trim();

  return (
    <div className="print-only investigation-print-version">
      {/* PAGE 1: COVER PAGE */}
      <div className="print-page cover-page">
        <div className="print-header no-border">
          <div className="print-header-left">
            <div>{currentInvestigation.ref_no || 'SSQA - 032'}</div>
            <div>{currentInvestigation.revision_info || 'July2022 / Rev 02'}</div>
          </div>
          <div className="print-header-right"></div>
        </div>
        
        <div className="cover-grid">
          <div className="cover-left-spacer"></div>
          <div className="cover-right-box">
            <div>
              <div className="cover-logo-container">
                <img src="/PAGSS.png" alt="PAGSS Logo" className="cover-logo-img" />
              </div>
              <h1 className="cover-title">
                Investigation Report:<br />
                {cleanTitle}
              </h1>
              <div className="cover-version">Version 01</div>
            </div>
            
            <div>
              <div className="cover-desc-box">
                This document contains the investigation report on the {cleanTitle}. 
                It presents the facts and relevant information gathered during the investigation to determine the 
                circumstances of the occurrence and support the implementation of appropriate safety measures.
              </div>
              <div className="cover-bottom-bar"></div>
            </div>
          </div>
        </div>
        
        <div className="print-footer">
          <div className="print-footer-line"></div>
          <div className="print-footer-content">
            <span>Investigation Report</span>
            <span>Cover Page</span>
          </div>
        </div>
      </div>

      {/* PAGE 2: TABLE OF CONTENTS */}
      <div className="print-page toc-page">
        <div className="print-header no-border">
          <div className="print-header-left">
            <div>{currentInvestigation.ref_no || 'SSQA - 032'}</div>
            <div>{currentInvestigation.revision_info || 'July2022 / Rev 02'}</div>
          </div>
          <div className="print-header-right">
            <img src="/PAGSS.png" alt="PAGSS Logo" className="print-header-logo" />
          </div>
        </div>
        
        <div className="toc-body">
          <h2 className="toc-title">TABLE OF CONTENTS</h2>
          <div className="toc-list">
            <div className="toc-item">
              <span className="toc-name">EXECUTIVE SUMMARY</span>
              <span className="toc-dots"></span>
              <span className="toc-page-num">2</span>
            </div>
            <div className="toc-item">
              <span className="toc-name">1. Factual Information</span>
              <span className="toc-dots"></span>
              <span className="toc-page-num">3</span>
            </div>
            <div className="toc-subitems-group">
              <div className="toc-subitem">1.1 Operational Irregularity</div>
              <div className="toc-subitem">1.2 Risk Index</div>
              <div className="toc-subitem">1.3 Personnel's Information</div>
            </div>
            
            <div className="toc-item">
              <span className="toc-name">2. Analysis</span>
              <span className="toc-dots"></span>
              <span className="toc-page-num">3</span>
            </div>
            
            <div className="toc-item">
              <span className="toc-name">3. Root Cause</span>
              <span className="toc-dots"></span>
              <span className="toc-page-num">3</span>
            </div>
            
            <div className="toc-item">
              <span className="toc-name">4. Immediate Actions/Corrective Action</span>
              <span className="toc-dots"></span>
              <span className="toc-page-num">4</span>
            </div>
            
            <div className="toc-item">
              <span className="toc-name">5. Preventive Action</span>
              <span className="toc-dots"></span>
              <span className="toc-page-num">4</span>
            </div>
            
            <div className="toc-item">
              <span className="toc-name">6. References</span>
              <span className="toc-dots"></span>
              <span className="toc-page-num">4</span>
            </div>
            
            <div className="toc-item">
              <span className="toc-name">7. Investigation Team</span>
              <span className="toc-dots"></span>
              <span className="toc-page-num">4</span>
            </div>
          </div>
        </div>
        
        <div className="print-footer">
          <div className="print-footer-line"></div>
          <div className="print-footer-content">
            <span>Investigation Report</span>
            <span>Page 1</span>
          </div>
        </div>
      </div>

      {/* PAGE 3: EXECUTIVE SUMMARY */}
      <div className="print-page exec-summary-page">
        <div className="print-header">
          <div className="print-header-left">
            <div>{currentInvestigation.ref_no || 'SSQA - 032'}</div>
            <div>{currentInvestigation.revision_info || 'July2022 / Rev 02'}</div>
          </div>
          <div className="print-header-right">
            <img src="/PAGSS.png" alt="PAGSS Logo" className="print-header-logo" />
          </div>
        </div>
        
        <div className="print-body">
          <h3 className="section-title-simple">Executive Summary:</h3>
          <p className="summary-text-block">{currentInvestigation.executive_summary || 'No summary provided.'}</p>
        </div>
        
        <div className="print-footer">
          <div className="print-footer-line"></div>
          <div className="print-footer-content">
            <span>Investigation Report</span>
            <span>Page 2</span>
          </div>
        </div>
      </div>

      {/* PAGE 4: SECTION 1, 2, 3, 4 */}
      <div className="print-page section-content-page">
        <div className="print-header">
          <div className="print-header-left">
            <div>{currentInvestigation.ref_no || 'SSQA - 032'}</div>
            <div>{currentInvestigation.revision_info || 'July2022 / Rev 02'}</div>
          </div>
          <div className="print-header-right">
            <img src="/PAGSS.png" alt="PAGSS Logo" className="print-header-logo" />
          </div>
        </div>
        
        <div className="print-body">
          <h3 className="section-title">1. Factual Information</h3>
          
          <h4 className="subsection-title">1.1 Operational Irregularity</h4>
          <p className="factual-text">'{currentInvestigation.operational_irregularity || 'N/A'}'</p>
          
          <h4 className="subsection-title">1.2 Risk Index</h4>
          <div className="print-risk-badge-wrapper">
            <div className="print-risk-badge" style={getRiskIndexStyle(currentInvestigation.risk_index)}>
              {currentInvestigation.risk_index || '2D - LOW'}
            </div>
          </div>
          
          <h4 className="subsection-title">1.3 Personnel Information</h4>
          <table className="print-personnel-table">
            <tbody>
              <tr>
                <th>ID Number</th>
                <td>{currentInvestigation.id_number || 'N/A'}</td>
              </tr>
              <tr>
                <th>Position</th>
                <td>{currentInvestigation.position || 'N/A'}</td>
              </tr>
              <tr>
                <th>Date of Hiring</th>
                <td>{currentInvestigation.date_of_hiring || 'N/A'}</td>
              </tr>
              <tr>
                <th>Trainings</th>
                <td>{currentInvestigation.trainings || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
          
          <h3 className="section-title" style={{ marginTop: '20px' }}>2. Analysis</h3>
          <div className="print-bullet-list">
            {(currentInvestigation.analysis || []).map((item, idx) => (
              <div key={idx} className="print-bullet-item">
                <span className="bullet-letter">{String.fromCharCode(97 + idx)})</span>
                <span className="bullet-content">{item}</span>
              </div>
            ))}
          </div>
          
          <h3 className="section-title" style={{ marginTop: '20px' }}>3. Root Cause:</h3>
          <div className="print-bullet-list">
            {(currentInvestigation.root_cause || []).map((item, idx) => {
              const parts = item.split(/ [-–—] /);
              return (
                <div key={idx} className="print-bullet-item">
                  <span className="bullet-letter">{String.fromCharCode(97 + idx)})</span>
                  <span className="bullet-content">
                    {parts.length > 1 ? (
                      <>
                        <strong>{parts[0]}</strong> – {parts.slice(1).join(' - ')}
                      </>
                    ) : (
                      item
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <h3 className="section-title" style={{ marginTop: '20px' }}>4. Immediate/Corrective Action</h3>
          <div className="print-bullet-list">
            {(currentInvestigation.corrective_action || []).map((item, idx) => (
              <div key={idx} className="print-bullet-item">
                <span className="bullet-letter">{String.fromCharCode(97 + idx)})</span>
                <span className="bullet-content">{item}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="print-footer">
          <div className="print-footer-line"></div>
          <div className="print-footer-content">
            <span>Investigation Report</span>
            <span>Page 3</span>
          </div>
        </div>
      </div>

      {/* PAGE 5: SECTION 5, 6, 7 */}
      <div className="print-page signature-page">
        <div className="print-header">
          <div className="print-header-left">
            <div>{currentInvestigation.ref_no || 'SSQA - 032'}</div>
            <div>{currentInvestigation.revision_info || 'July2022 / Rev 02'}</div>
          </div>
          <div className="print-header-right">
            <img src="/PAGSS.png" alt="PAGSS Logo" className="print-header-logo" />
          </div>
        </div>
        
        <div className="print-body">
          <h3 className="section-title">5. Preventive Action</h3>
          <div className="print-bullet-list">
            {(currentInvestigation.preventive_action || []).map((item, idx) => (
              <div key={idx} className="print-bullet-item">
                <span className="bullet-letter">{String.fromCharCode(97 + idx)})</span>
                <span className="bullet-content">{item}</span>
              </div>
            ))}
          </div>

          <h3 className="section-title" style={{ marginTop: '25px' }}>4. References</h3>
          <div className="print-references-text">
            {currentInvestigation.references_text ? 
              currentInvestigation.references_text.split('\n').map((line, lidx) => (
                <div key={lidx} style={{ marginBottom: '4px' }}>
                  {line.replace(/^:\s*-\s*/, ': ').replace(/^-\s*/, ': ').trim()}
                </div>
              ))
              : 'No references listed.'
            }
          </div>

          <h3 className="section-title" style={{ marginTop: '25px' }}>5. Investigation Team</h3>
          <div className="print-signatures-container">
            <div className="print-sig-box">
              <span className="sig-label">Prepared by:</span>
              <div className="sig-space">
                {currentInvestigation.prepared_by_name && currentInvestigation.prepared_by_name.toLowerCase().includes('borromeo') && (
                  <img src="/signatures/borromeo.png" alt="Signature" className="print-sig-img" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div className="sig-name">{currentInvestigation.prepared_by_name || 'N/A'}</div>
              <div className="sig-role">{currentInvestigation.prepared_by_role || 'N/A'}</div>
            </div>
            <div className="print-sig-box">
              <span className="sig-label">Approved by:</span>
              <div className="sig-space">
                {currentInvestigation.approved_by_name && currentInvestigation.approved_by_name.toLowerCase().includes('magsayo') && (
                  <img src="/signatures/magsayo.png" alt="Signature" className="print-sig-img" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <div className="sig-name">{currentInvestigation.approved_by_name || 'N/A'}</div>
              <div className="sig-role">{currentInvestigation.approved_by_role || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        <div className="print-footer">
          <div className="print-footer-line"></div>
          <div className="print-footer-content">
            <span>Investigation Report</span>
            <span>Page 4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
