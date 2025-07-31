"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle, User } from "lucide-react";

export default function AdminProfile() {
  const { user, updateAdmin, loading, error, clearError } = useStore();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    password: "",
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccess(false);

    if (!formData.name || !formData.password) {
      return;
    }

    try {
      await updateAdmin(formData.name, formData.password);
      setSuccess(true);
      setFormData((prev) => ({ ...prev, password: "" })); // Clear password field
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      // Error is already handled in the store
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>{t("adminProfile")}</span>
        </CardTitle>
        <CardDescription>{t("updateCredentials")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{t("credentialsUpdatedSuccess")}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t("adminName")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("adminName")}
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("newPassword")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("newPassword")}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !formData.name || !formData.password}
          >
            {loading ? t("updating") : t("updateAdmin")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
