export default function SpecifiedCommercialTransactions() {
  return (
    <div style={{ lineHeight: '1.8' }}>


      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
        <tbody>
          <tr>
            <th style={tableHeaderStyle}>販売事業者名</th>
            <td style={tableCellStyle}>佐々木拓海</td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>責任者</th>
            <td style={tableCellStyle}>佐々木拓海</td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>所在地</th>
            <td style={tableCellStyle}>
              ご請求をいただいた場合、遅滞なく開示いたします。
            </td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>電話番号</th>
            <td style={tableCellStyle}>
              ご請求をいただいた場合、遅滞なく開示いたします。
            </td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>メールアドレス</th>
            <td style={tableCellStyle}>foruploadyou@gmail.com</td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>販売価格</th>
            <td style={tableCellStyle}>100回分チケット：200円（税込）</td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>商品代金以外に必要な費用</th>
            <td style={tableCellStyle}>当サイトの閲覧、サービスの利用に必要となるインターネット接続料金、通信料金等はお客様のご負担となります。</td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>支払方法と支払の時期</th>
            <td style={tableCellStyle}>支払方法：クレジットカード決済（Stripe）<br />支払時期：購入手続き完了時に即時決済されます。</td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>サービスの提供時期</th>
            <td style={tableCellStyle}>クレジットカード決済完了後、即時にチケットが付与され、ご利用可能となります。</td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>返品・キャンセルについて</th>
            <td style={tableCellStyle}>商品の性質上（デジタルコンテンツ）、購入完了後の返品・返金・キャンセルには一切応じられません。あらかじめご了承ください。</td>
          </tr>
          <tr>
            <th style={tableHeaderStyle}>動作環境</th>
            <td style={tableCellStyle}>インターネット接続環境および最新のWebブラウザ（Google Chrome、Safari、Edge等）が必要です。</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: '30px', marginBottom: '10px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>【住所および電話番号の省略について（開示請求）】</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        上記にて省略としている「所在地」「電話番号」につきましては、ご請求をいただいた場合、遅滞なく電子メール等にて開示いたします。開示をご希望の場合は、上記メールアドレスまでお問い合わせください。
      </p>
    </div>
  );
}

const tableHeaderStyle = {
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '12px',
  textAlign: 'left',
  backgroundColor: 'rgba(255,255,255,0.05)',
  width: '35%',
  fontWeight: 'bold',
  color: 'var(--text-primary)',
  verticalAlign: 'top'
};

const tableCellStyle = {
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '12px',
  textAlign: 'left',
  color: 'var(--text-secondary)',
  verticalAlign: 'top'
};
