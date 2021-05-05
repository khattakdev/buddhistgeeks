import h from "react-hyperscript";
import { useRouter } from "next/router";
import { useApiData, callApi } from "src/apiHelpers";
import { GetTemplatesResult } from "pages/api/courses/[id]/templates";
import { PageLoader } from "components/Loader";
import { useState, useEffect } from "react";
import { course_templates } from "@prisma/client";
import { Box, LabelBox, FormBox } from "components/Layout";
import { Input, Radio } from "components/Form";
import { Primary, BackButton, Destructive } from "components/Button";
import {
  CreateTemplateMsg,
  CreateTemplateResult,
} from "pages/api/courses/[id]/templates";
import {
  UpdateTemplateMsg,
  UpdateTemplateResult,
} from "pages/api/courses/[id]/templates/[templateId]";
import EditorWithPreview from "components/EditorWithPreview";

function TemplateSettings() {
  let router = useRouter();
  let templateId = router.query.templateId;
  let courseId = router.query.id as string;
  let { data: templates, mutate } = useApiData<GetTemplatesResult>(
    courseId ? `/api/courses/${courseId}/templates` : undefined
  );
  let template = templates
    ? templates.find((t) => t.name === templateId)
    : undefined;

  let [formState, setFormState] = useState<
    Omit<course_templates, "course" | "required">
  >(template || { name: "", content: "", type: "prepopulated", title: "" });
  let [status, setStatus] = useState<"loading" | "normal" | "success">(
    "normal"
  );

  useEffect(() => {
    if (template) setFormState(template);
  }, [template]);

  if (templateId !== "new" && templates === undefined) return h(PageLoader);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res: CreateTemplateResult | UpdateTemplateResult;
    setStatus("loading");
    if (templateId === "new") {
      res = await callApi<CreateTemplateMsg, CreateTemplateResult>(
        `/api/courses/${courseId}/templates`,
        formState
      );
      if (res.status === 200 && templates) {
        templates.push(res.result);
        mutate(templates);
      }
    } else {
      res = await callApi<UpdateTemplateMsg, UpdateTemplateResult>(
        `/api/courses/${courseId}/templates/${templateId}`,
        formState
      );
      if (res.status === 200 && templates) {
        if (res.result.name !== templateId) {
          router.replace(
            `/courses/[slug]/[id]/settings/templates/[templateId]`,
            `/courses/${router.query.slug}/${router.query.id}/settings/templates/${res.result.name}`,
            { shallow: true }
          );
        }
        mutate(
          templates?.map((t) => {
            if (res.status === 200 && template && t.name === template.name)
              return res.result;
            return t;
          })
        );
      }
    }
    if (res.status === 200) {
      setStatus("success");
      if (templateId === "new")
        router.push(
          `/courses/[slug]/[id]/settings/templates/[templateId]`,
          `/courses/${router.query.slug}/${router.query.id}/settings/templates/${res.result.name}`
        );
    }
  };

  let disabled =
    templateId !== "new" &&
    template &&
    !(
      formState.name !== template.name ||
      formState.title !== template.title ||
      formState.content !== template.content ||
      formState.type !== template.type
    );

  return h(Box, { gap: 32 }, [
    h(Box, { width: 640 }, [
      h(
        BackButton,
        {
          href: "/courses/[slug]/[id]/settings",
          as: `/courses/${router.query.slug}/${courseId}/settings`,
        },
        "Settings"
      ),
      h(
        "h2",
        router.query.templateId === "new" ? "Add New Template" : "Edit Template"
      ),
      h(
        "p.big",
        `Create templates for topics to either be included in every new cohort's forum, or to be triggered by a facilitator at any time.`
      ),
    ]),
    h(FormBox, { onSubmit, gap: 32 }, [
      // Template Name Input
      h(LabelBox, { width: 400, gap: 8 }, [
        h("h4", "Template Name"),
        h(Input, {
          disabled: template?.required || undefined,
          type: "text",
          value: formState.name,
          onChange: (e) =>
            setFormState({ ...formState, name: e.currentTarget.value }),
        }),
      ]),

      // Template Type Input
      h(LabelBox, { width: 640, gap: 8 }, [
        h("h4", "Type"),
        h(Radio, {
          disabled: template?.required || undefined,
          name: "type",
          selected: formState.type,
          onChange: (v) => {
            setFormState({ ...formState, type: v as typeof formState.type });
          },
          items: [
            {
              value: "prepopulated",
              component: h("div", [
                h("h4", "Prepopulated"),
                h(
                  "span.textSecondary",
                  "This topic will automatically be posted when each new cohort is created."
                ),
              ]),
            },
            {
              value: "triggered",
              component: h("div", [
                h("h4", "Triggered"),
                h(
                  "span.textSecondary",
                  "This topic will be posted when the facilitator triggers it from the cohort settings page."
                ),
              ]),
            },
          ] as const,
        }),
      ]),

      // Template Title Input
      h(LabelBox, { width: 400, gap: 8 }, [
        h(Box, { gap: 4 }, [
          h("h4", "Default Topic Title"),
          h(
            "p.textSecondary",
            "Default title of the published topic. For a triggered template, you'll be able to edit before publishing."
          ),
        ]),
        h(Input, {
          type: "text",
          value: formState.title,
          onChange: (e) =>
            setFormState({ ...formState, title: e.currentTarget.value }),
        }),
      ]),

      // Template Body Input
      h(LabelBox, { gap: 8 }, [
        h(Box, { gap: 4 }, [
          h("h4", "Default Topic Body"),
          h(Box, { width: 400 }, [
            h(
              "p.textSecondary",
              "Default body text of the published topic. For a triggered template, you'll be able to edit before publishing."
            ),
            h("p.textSecondary", [
              "You can use Markdown to format ",
              h(
                "a",
                { href: "https://commonmark.org/help/" },
                "(quick reference)"
              ),
              ".",
            ]),
          ]),
        ]),
        h(EditorWithPreview, {
          value: formState.content,
          onChange: (e) =>
            setFormState({ ...formState, content: e.currentTarget.value }),
        }),
      ]),

      // Submit and Discard Changes Button
      h(Box, { h: true, gap: 8, style: { justifySelf: "end" } }, [
        h(
          Destructive,
          {
            disabled,
            onClick: (e) => {
              e.preventDefault();
              if (template) setFormState(template);
            },
          },
          "Discard Changes"
        ),
        h(
          Primary,
          {
            status,
            type: "submit",
            disabled,
          },
          templateId === "new" ? "Create New Template" : "Update Template"
        ),
      ]),
    ]),
  ]);
}

export default TemplateSettings;
