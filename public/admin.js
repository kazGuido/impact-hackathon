(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const status = (s) => { $("#adminStatus").textContent = s; };
  let candidates = [];
  function filterQueue() {
    const query = $("#queueSearch").value.toLowerCase().trim(), state = $("#queueStatus").value;
    let shown = 0;
    for (const row of document.querySelectorAll("#candidateList [data-id]")) {
      const c = candidates.find((x) => x.id === row.dataset.id);
      const match = (!query || `${c.title} ${c.audience} ${c.region}`.toLowerCase().includes(query)) && (state === "all" || state === "active" && ["candidate", "draft"].includes(c.status) || c.status === state);
      row.hidden = !match; if (match) shown++;
    }
    const pending = candidates.filter(c => ["candidate", "draft"].includes(c.status)).length;
    const pendingCount = $("#pendingCount");
    if (pendingCount) pendingCount.textContent = pending;
    $("#queueCount").textContent = pendingCount ? `${shown} shown` : `${shown} shown · ${pending} need review`;
    $("#queueEmpty").hidden = shown > 0 || candidates.length === 0;
  }
  async function api(path, method = "GET", body) {
    const res = await fetch(path, { method, headers: { "content-type": "application/json" }, body: body && JSON.stringify(body) });
    const data = await res.json();
    if (!data.ok) throw new Error(data.reason || "Request failed");
    return data;
  }
  async function refresh() {
    const [sources, queue, analytics] = await Promise.all([api("/api/admin/sources"), api("/api/admin/candidates"), api("/api/admin/analytics")]);
    const openRows = new Set([...document.querySelectorAll("#candidateList details[open]")].map(row => row.closest("[data-id]").dataset.id));
    $("#sourcesList").innerHTML = sources.sources.map((s) => `<article class="admin-item"><b>${esc(s.title)}</b><p>${esc(s.source_date)} · ${esc(s.region)} · ${esc(s.audience)}</p><a href="${esc(s.source_url)}" target="_blank" rel="noopener noreferrer">Read original alert</a><button type="button" data-source="${esc(s.source_url)}">Use this source</button></article>`).join("");
    candidates = queue.candidates;
    $("#candidateList").innerHTML = candidates.length ? candidates.map((c) => `<article class="admin-item queue-row" data-id="${esc(c.id)}"><details><summary><span class="row-main"><b>${esc(c.title)}</b><small>${esc(c.source_date || "No date")} · ${esc(c.region || "Any region")} · ${esc(c.audience || "General public")}</small></span><span class="status-tag">${esc(c.status)}</span></summary><div class="queue-detail">${c.source_url.startsWith("https://") ? `<a href="${esc(c.source_url)}" target="_blank" rel="noopener noreferrer">Review source</a>` : "<p>Private partner topic</p>"}
      <label>Notes for AI<input class="notes" placeholder="Scam pattern and who it affects"></label><button type="button" data-action="draft">Draft with AI</button>
      ${c.draft ? `<div class="draft-fields"><label>Practice message<textarea data-field="message">${esc(c.draft.message)}</textarea></label><label>Correct answer<select data-field="is_scam"><option value="true" ${c.draft.is_scam ? "selected" : ""}>Scam</option><option value="false" ${!c.draft.is_scam ? "selected" : ""}>Real</option></select></label><label>Sender<input data-field="sender" value="${esc(c.draft.sender)}"></label><label>Explanation<textarea data-field="explanation">${esc(c.draft.explanation)}</textarea></label><label>Hint one<input data-field="hint0" value="${esc(c.draft.hints[0])}"></label><label>Hint two<input data-field="hint1" value="${esc(c.draft.hints[1])}"></label><label>Warning sign IDs (comma separated)<input data-field="signs" value="${esc(c.draft.signs.join(", "))}"></label><button type="button" data-action="save">Save edits</button><button type="button" data-action="publish">Approve and publish</button>${c.status === "published" ? `<button type="button" data-action="simulate">Copy practice SMS</button>` : ""}</div>` : ""}
      <button type="button" data-action="reject">Reject</button><button type="button" data-action="archive">Archive</button></div></details></article>`).join("") : "<p>No candidates yet. Collect sources or add one above.</p>";
    filterQueue();
    for (const row of document.querySelectorAll("#candidateList [data-id]")) {
      row.querySelector("details").open = openRows.has(row.dataset.id);
      const statusTag = row.querySelector(".status-tag");
      statusTag.dataset.state = statusTag.textContent;
    }
    const a = analytics;
    const total = a.totals.total || 0;
    const metrics = [[total, "Opt-in exercises"], [a.totals.correct || 0, "Correct first tries"], [a.totals.checks || 0, "Follow-up checks"]];
    const overview = $("#pendingCount")
      ? `<div class="insight-metrics">${metrics.map(([value, label]) => `<div><strong>${esc(value)}</strong>${label}</div>`).join("")}</div>`
      : `<p><b>${total}</b> opt-in exercises · <b>${a.totals.correct || 0}</b> correct on first try · <b>${a.totals.checks || 0}</b> follow-up checks</p>`;
    $("#insightsList").innerHTML = overview + Object.entries(a.gaps).sort((x, y) => y[1].missed - x[1].missed)
      .map(([sign, n]) => `<p class="insight-gap">${esc(sign.replaceAll("_", " "))}: ${n.missed} missed out of ${n.attempts} exercises</p>`).join("");
  }
  $("#sourceForm").addEventListener("submit", async (e) => {
    e.preventDefault(); const b = Object.fromEntries(new FormData(e.target)); b.private_topic = b.private_topic === "on";
    try { await api("/api/admin/candidates", "POST", b); e.target.reset(); status("Candidate added."); await refresh(); } catch (err) { status(err.message); }
  });
  $("#queueSearch").addEventListener("input", filterQueue);
  $("#queueStatus").addEventListener("change", filterQueue);
  $("#collect").addEventListener("click", async () => {
    const button = $("#collect"); button.disabled = true; button.textContent = "Collecting…";
    try { const result = await api("/api/admin/collect", "POST", {}); status(`${result.created} new drafts. ${result.today} drafted today.${result.errors?.length ? ` ${result.errors.length} sources failed.` : ""}`); await refresh(); }
    catch (err) { status(err.message); }
    finally { button.disabled = false; button.textContent = "Collect today's candidates"; }
  });
  document.addEventListener("click", async (e) => {
    const source = e.target.closest("[data-source]");
    if (source) {
      $("#addSource").open = true;
      const title = $("#sourceForm [name=title]");
      title.value = source.parentElement.querySelector("b").textContent;
      $("#sourceForm [name=source_url]").value = source.dataset.source;
      $("#sourceForm [name=private_topic]").checked = false;
      title.focus();
      return;
    }
    const button = e.target.closest("[data-action]"); if (!button) return;
    const card = button.closest("[data-id]"), id = card.dataset.id, action = button.dataset.action;
    try {
      if (action === "simulate") {
        const c = candidates.find((x) => x.id === id);
        const link = new URL(`/v3?awareness=candidate-${id}`, location.origin).href;
        await navigator.clipboard.writeText(`Look Twice practice message (fictional): ${c.draft.message}\n\nOpen the awareness lesson: ${link}`);
        status("Practice SMS copied. Choose a recipient and send it yourself."); return;
      }
      let body = {};
      if (action === "draft") body = { notes: card.querySelector(".notes").value };
      if (action === "save" || action === "publish") {
        const fields = Object.fromEntries([...card.querySelectorAll("[data-field]")].map((x) => [x.dataset.field, x.value]));
        body = { draft: { is_scam: fields.is_scam === "true", message: fields.message, sender: fields.sender, explanation: fields.explanation, hints: [fields.hint0, fields.hint1], signs: fields.signs.split(",").map((x) => x.trim()).filter(Boolean) } };
        if (action === "publish") await api(`/api/admin/candidates/${id}/save`, "POST", body);
      }
      await api(`/api/admin/candidates/${id}/${action}`, "POST", body);
      status({draft:"Draft ready for review.", save:"Edits saved.", publish:"Lesson published.", reject:"Candidate rejected.", archive:"Candidate archived."}[action]); await refresh();
    } catch (err) { status(err.message); }
  });
  $("#recommend").addEventListener("click", async () => {
    try { $("#recommendation").textContent = "Thinking…"; const r = await api("/api/admin/recommend", "POST", {}); $("#recommendation").textContent = r.summary; }
    catch (err) { $("#recommendation").textContent = err.message; }
  });
  refresh().catch((err) => status(err.message));
})();
