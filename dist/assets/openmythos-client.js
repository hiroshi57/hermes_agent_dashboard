/**
 * openmythos-client.js — OpenMythos 連携クライアント (依存ゼロ / ブラウザ用)
 *
 * 静的ダッシュボードから OpenMythos のマーケ系 API を叩くための薄いラッパー。
 * 直接 OpenMythos を呼ばず、必ず同一オリジンの /api/openmythos プロキシ経由で
 * 呼ぶ (API キーはサーバー側に隠蔽)。
 *
 * 使い方:
 *   const om = new OpenMythosClient();                       // 既定: /api/openmythos
 *   const copy = await om.generateAdCopy({ name:'夏キャンペーン', scenario:'30代向け日焼け止め' });
 *   const dash = await om.getLLMODashboard('acme');
 *
 * テスト/別ホスト用に base を差し替え可能:
 *   new OpenMythosClient({ proxyBase: '/api/openmythos' })
 */
(function (global) {
  'use strict';

  class OpenMythosClient {
    constructor(opts = {}) {
      this.proxyBase = opts.proxyBase || '/api/openmythos';
    }

    async _call(method, path, body) {
      const url = `${this.proxyBase}?path=${encodeURIComponent(path)}`;
      const init = { method, headers: { 'Content-Type': 'application/json' } };
      if (method === 'POST') init.body = JSON.stringify(body || {});
      const res = await fetch(url, init);
      const text = await res.text();
      let data;
      try { data = text ? JSON.parse(text) : null; } catch (_) { data = { raw: text }; }
      if (!res.ok) {
        const msg = (data && (data.error || data.detail)) || `HTTP ${res.status}`;
        throw new Error(`OpenMythos: ${msg}`);
      }
      return data;
    }

    // ── 広告コピー生成 (CEP→コピー→評価) : POST /v1/campaign/workflow ──
    generateAdCopy({
      name,
      scenario,
      objective = 'awareness',
      budgetTotal = 100000,
      budgetDaily = 10000,
      currency = 'JPY',
      channels = [],
      cepIds = [],
      tags = [],
      description = '',
      extra = {},
    } = {}) {
      if (!name || !scenario) throw new Error('generateAdCopy: name と scenario は必須です');
      return this._call('POST', '/v1/campaign/workflow', {
        name, scenario, objective,
        budget_total: budgetTotal,
        budget_daily: budgetDaily,
        currency, channels,
        cep_ids: cepIds,
        tags, description, extra,
      });
    }

    // ── LLMO ダッシュボード : GET /v1/llmo/dashboard/{brand} ──
    getLLMODashboard(brand) {
      return this._call('GET', `/v1/llmo/dashboard/${encodeURIComponent(brand)}`);
    }

    getLLMOTrend(brand) {
      return this._call('GET', `/v1/llmo/dashboard/${encodeURIComponent(brand)}/trend`);
    }

    // ── LLMO スナップショット追加 : POST /v1/llmo/snapshot ──
    addLLMOSnapshot({ brand, prompt, mentionRate, citationRate = 0, referenceRate = 0, cepId = null, notes = '' }) {
      return this._call('POST', '/v1/llmo/snapshot', {
        brand_name: brand,
        prompt,
        mention_rate: mentionRate,
        citation_rate: citationRate,
        reference_rate: referenceRate,
        cep_id: cepId,
        notes,
      });
    }

    // ── A/B テスト : POST /v1/abtest/ ──
    createABTest({ name, campaignId = null, description = '', variants = [] }) {
      return this._call('POST', '/v1/abtest/', {
        name, campaign_id: campaignId, description, variants,
      });
    }

    getABReport(testId) {
      return this._call('GET', `/v1/abtest/${encodeURIComponent(testId)}/report`);
    }

    // ── キャンペーン KPI : GET /v1/analytics/{id}/kpis ──
    getCampaignKpis(campaignId) {
      return this._call('GET', `/v1/analytics/${encodeURIComponent(campaignId)}/kpis`);
    }
  }

  // UMD 風: グローバル + CommonJS 両対応
  global.OpenMythosClient = OpenMythosClient;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OpenMythosClient;
  }
})(typeof window !== 'undefined' ? window : globalThis);
