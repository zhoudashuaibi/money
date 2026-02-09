"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2, Save, Plus, Trash2, Star, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import {
  useLlmConfigs,
  useCreateLlmConfig,
  useUpdateLlmConfig,
  useDeleteLlmConfig,
} from "@/hooks/use-llm-config";
import type { LlmConfig } from "@/types";

export default function SettingsPage() {
  const { user, setAuth } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // LLM 配置相关
  const { data: configs, isLoading: configsLoading } = useLlmConfigs();
  const createMutation = useCreateLlmConfig();
  const updateMutation = useUpdateLlmConfig();
  const deleteMutation = useDeleteLlmConfig();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    providerName: "",
    apiKey: "",
    baseUrl: "",
    model: "",
    isDefault: false,
  });
  const [showApiKey, setShowApiKey] = useState(false);

  // Tavily 配置相关
  const [showTavilyForm, setShowTavilyForm] = useState(false);
  const [tavilyForm, setTavilyForm] = useState({ apiKey: "", baseUrl: "https://api.tavily.com" });
  const [showTavilyKey, setShowTavilyKey] = useState(false);
  const [editingTavily, setEditingTavily] = useState(false);

  // 从配置列表中提取 Tavily 配置
  const tavilyConfig = configs?.find((c) => c.providerName === "tavily");
  // 过滤掉 Tavily 的 LLM 配置列表
  const llmConfigs = configs?.filter((c) => c.providerName !== "tavily");

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const { data } = await api.patch("/auth/profile", { nickname });
      setAuth(data.data.user, localStorage.getItem("access_token") || "");
      setMessage("保存成功");
    } catch {
      setMessage("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ providerName: "", apiKey: "", baseUrl: "", model: "", isDefault: false });
    setEditingId(null);
    setShowForm(false);
    setShowApiKey(false);
  };

  const handleCreateOrUpdate = async () => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...form });
    } else {
      await createMutation.mutateAsync(form);
    }
    resetForm();
  };

  const handleEdit = (config: LlmConfig) => {
    setForm({
      providerName: config.providerName,
      apiKey: "", // 不回填脱敏的 key
      baseUrl: config.baseUrl,
      model: config.model,
      isDefault: config.isDefault,
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  const handleSetDefault = async (config: LlmConfig) => {
    await updateMutation.mutateAsync({ id: config.id, isDefault: true });
  };

  // Tavily 配置处理
  const handleTavilyEdit = () => {
    if (tavilyConfig) {
      setTavilyForm({ apiKey: "", baseUrl: tavilyConfig.baseUrl });
      setEditingTavily(true);
    }
    setShowTavilyForm(true);
  };

  const handleTavilySave = async () => {
    if (editingTavily && tavilyConfig) {
      // 更新现有配置
      await updateMutation.mutateAsync({
        id: tavilyConfig.id,
        ...(tavilyForm.apiKey ? { apiKey: tavilyForm.apiKey } : {}),
        baseUrl: tavilyForm.baseUrl,
      });
    } else {
      // 创建新配置
      await createMutation.mutateAsync({
        providerName: "tavily",
        apiKey: tavilyForm.apiKey,
        baseUrl: tavilyForm.baseUrl,
        model: "default",
        isDefault: false,
      });
    }
    setShowTavilyForm(false);
    setTavilyForm({ apiKey: "", baseUrl: "https://api.tavily.com" });
    setEditingTavily(false);
    setShowTavilyKey(false);
  };

  const handleTavilyDelete = async () => {
    if (tavilyConfig) {
      await deleteMutation.mutateAsync(tavilyConfig.id);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>

      {/* 个人信息 */}
      <div className="rounded-lg border p-6 space-y-4 max-w-2xl">
        <h2 className="text-lg font-semibold">个人信息</h2>
        <div className="space-y-2">
          <label className="text-sm font-medium">邮箱</label>
          <Input value={user?.email || ""} disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">昵称</label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="输入昵称"
          />
        </div>
        {message && (
          <p className={`text-sm ${message.includes("成功") ? "text-green-600" : "text-destructive"}`}>
            {message}
          </p>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          保存
        </Button>
      </div>

      {/* LLM 模型配置 */}
      <div className="rounded-lg border p-6 space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI 模型配置</h2>
          {!showForm && (
            <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="mr-1 h-4 w-4" /> 新增配置
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          配置第三方 LLM 模型（兼容 OpenAI 接口），在 AI 分析时可选择使用。
        </p>

        {/* 新增/编辑表单 */}
        {showForm && (
          <div className="rounded border p-4 space-y-3 bg-muted/30">
            <h3 className="text-sm font-semibold">
              {editingId ? "编辑配置" : "新增配置"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">提供商名称</label>
                <Input
                  placeholder="如 deepseek、openai"
                  value={form.providerName}
                  onChange={(e) => setForm({ ...form, providerName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">模型代号</label>
                <Input
                  placeholder="如 deepseek-chat、gpt-4o"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Base URL</label>
              <Input
                placeholder="如 https://api.deepseek.com/v1"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">API Key</label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder={editingId ? "留空则不修改" : "输入 API Key"}
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              设为默认模型
            </label>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateOrUpdate} disabled={isMutating || !form.providerName || !form.baseUrl || !form.model || (!editingId && !form.apiKey)}>
                {isMutating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                {editingId ? "更新" : "保存"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 配置列表 */}
        {configsLoading ? (
          <div className="text-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mx-auto" />
          </div>
        ) : llmConfigs && llmConfigs.length > 0 ? (
          <div className="space-y-2">
            {llmConfigs.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded border p-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{c.providerName}</span>
                    <span className="text-xs text-muted-foreground">{c.model}</span>
                    {c.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">默认</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.baseUrl} | Key: {c.apiKey}
                  </div>
                </div>
                <div className="flex gap-1">
                  {!c.isDefault && (
                    <Button size="sm" variant="ghost" onClick={() => handleSetDefault(c)} title="设为默认">
                      <Star className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(c)}>
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteMutation.mutate(c.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">
            暂无配置，点击"新增配置"添加第三方模型。
          </p>
        )}
      </div>

      {/* Tavily 搜索服务配置 */}
      <div className="rounded-lg border p-6 space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">搜索服务配置</h2>
          {!showTavilyForm && !tavilyConfig && (
            <Button size="sm" onClick={() => { setShowTavilyForm(true); setEditingTavily(false); }}>
              <Plus className="mr-1 h-4 w-4" /> 配置 Tavily
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          配置 Tavily Search API，用于 AI 分析时获取最新新闻资讯。
        </p>

        {/* Tavily 配置表单 */}
        {showTavilyForm && (
          <div className="rounded border p-4 space-y-3 bg-muted/30">
            <h3 className="text-sm font-semibold">
              {editingTavily ? "编辑 Tavily 配置" : "新增 Tavily 配置"}
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-medium">API Key</label>
              <div className="relative">
                <Input
                  type={showTavilyKey ? "text" : "password"}
                  placeholder={editingTavily ? "留空则不修改" : "输入 Tavily API Key"}
                  value={tavilyForm.apiKey}
                  onChange={(e) => setTavilyForm({ ...tavilyForm, apiKey: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowTavilyKey(!showTavilyKey)}
                >
                  {showTavilyKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Base URL（可选）</label>
              <Input
                placeholder="https://api.tavily.com"
                value={tavilyForm.baseUrl}
                onChange={(e) => setTavilyForm({ ...tavilyForm, baseUrl: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleTavilySave}
                disabled={isMutating || (!editingTavily && !tavilyForm.apiKey)}
              >
                {isMutating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                {editingTavily ? "更新" : "保存"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowTavilyForm(false);
                  setTavilyForm({ apiKey: "", baseUrl: "https://api.tavily.com" });
                  setEditingTavily(false);
                  setShowTavilyKey(false);
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}

        {/* Tavily 配置展示 */}
        {!showTavilyForm && tavilyConfig && (
          <div className="flex items-center justify-between rounded border p-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Tavily Search</span>
                <span className="text-xs bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">已配置</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {tavilyConfig.baseUrl} | Key: {tavilyConfig.apiKey}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={handleTavilyEdit}>
                编辑
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={handleTavilyDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {!showTavilyForm && !tavilyConfig && (
          <p className="text-sm text-muted-foreground py-2">
            暂未配置，将使用系统默认配置（如有）。
          </p>
        )}
      </div>
    </div>
  );
}
