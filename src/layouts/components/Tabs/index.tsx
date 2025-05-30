import IconComponent from "@/components/icons/IconComponent";
import { HOME_URL } from "@/config/config";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { layoutRoute } from "@/routes";
import { setTabsList } from "@/store/modules/tabsSlice";
import { searchRoute } from "@/utils";
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor } from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	horizontalListSortingStrategy,
	useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tabs, TabsProps } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import MoreButton from "./components/MoreButton";
import clsx from "clsx";
import "./index.scss";

interface DraggableTabNodeProps extends React.HTMLAttributes<HTMLDivElement> {
	"data-node-key": string;
}

const DraggableTabNode: React.FC<DraggableTabNodeProps> = ({ className, ...props }) => {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
		id: props["data-node-key"]
	});

	const style: React.CSSProperties = {
		...props.style,
		transform: CSS.Translate.toString(transform),
		transition,
		cursor: "move"
	};

	return React.cloneElement(props.children as React.ReactElement<any>, {
		ref: setNodeRef,
		style,
		...attributes,
		...listeners
	});
};

const LayoutTabs = () => {
	const { tabsList } = useAppSelector(state => state.tabs);
	const { themeConfig } = useAppSelector(state => state.global);
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

	const [activeValue, setActiveValue] = useState<string>(pathname);

	useEffect(() => {
		addTabs();
	}, [pathname]);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// 点击tab
	const clickTabs = (path: string) => {
		navigate(path);
	};

	// 添加tabs
	const addTabs = () => {
		const route = searchRoute(pathname, [layoutRoute]);
		const newTabsList = [...tabsList];

		if (
			Object.keys(route.params).length === 0 &&
			tabsList.every((item: any) => item.path !== route.path)
		) {
			newTabsList.push({
				title: route.meta?.title || "",
				path: route.path as string
			});
		}

		dispatch(setTabsList(newTabsList));
		setActiveValue(pathname);
	};

	// 删除tab
	const delTabs = (tabPath?: string) => {
		if (tabPath === HOME_URL) return;

		if (pathname === tabPath) {
			tabsList.forEach((item: any, index: number) => {
				if (item.path !== pathname) return;
				const nextTab = tabsList[index + 1] || tabsList[index - 1];
				if (!nextTab) return;
				navigate(nextTab.path);
			});
		}

		dispatch(setTabsList(tabsList.filter((item: any) => item.path !== tabPath)));
	};

	// 处理拖拽结束
	const onDragEnd = ({ active, over }: DragEndEvent) => {
		if (active.id !== over?.id) {
			const newTabsList = arrayMove(
				tabsList,
				tabsList.findIndex(tab => tab.path === active.id),
				tabsList.findIndex(tab => tab.path === over?.id)
			);
			dispatch(setTabsList(newTabsList));
		}
	};

	const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } });

	const tabItems: TabsProps["items"] = tabsList.map((item: any) => ({
		key: item.path,
		label: item.title,
		closable: item.path !== HOME_URL,
		icon: item.path === HOME_URL ? <IconComponent name="HomeFilled" /> : undefined
	}));

	if (themeConfig.tabs) return null;
	else {
		return (
			<DndContext sensors={[sensor]} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
				<SortableContext
					items={tabsList.map((item: any) => item.path)}
					strategy={horizontalListSortingStrategy}
				>
					<Tabs
						className={clsx(
							"tabs",
							"pl-[13px] relative bg-white",
							"border-b border-solid border-[#f6f6f6]",
							"[&_.ant-tabs-nav]:m-0",
							"[&_.ant-tabs-nav::before]:border-none",
							"[&_.ant-tabs-ink-bar]:visible",
							"[&_.ant-tabs-tab-with-remove.ant-tabs-tab-active_.ant-tabs-tab-remove]:text-blue-500 [&_.ant-tabs-tab-with-remove.ant-tabs-tab-active_.ant-tabs-tab-remove]:opacity-100",
							"[&_.ant-tabs-tab-with-remove.ant-tabs-tab-active_.ant-tabs-tab-btn]:-translate-x-[9px]",
							"[&_.ant-tabs-tab]:p-[8px_22px] [&_.ant-tabs-tab]:text-[#cccccc] [&_.ant-tabs-tab]:bg-transparent [&_.ant-tabs-tab]:border-none",
							"[&_.ant-tabs-tab-remove]:absolute [&_.ant-tabs-tab-remove]:right-0 [&_.ant-tabs-tab-remove]:text-[#cccccc] [&_.ant-tabs-tab-remove]:opacity-0 [&_.ant-tabs-tab-remove]:transition-[0.1s_ease-in-out]",
							"[&_.ant-tabs-tab-remove:hover]:text-blue-500",
							"[&_.ant-tabs-tab.ant-tabs-tab-with-remove:hover_.ant-tabs-tab-remove]:opacity-100 [&_.ant-tabs-tab.ant-tabs-tab-with-remove:hover_.ant-tabs-tab-remove]:transition-[0.1s_ease-in-out]",
							"[&_.ant-tabs-tab.ant-tabs-tab-with-remove:hover_.ant-tabs-tab-btn]:-translate-x-[9px]"
						)}
						animated
						activeKey={activeValue}
						onChange={clickTabs}
						hideAdd
						type="editable-card"
						items={tabItems}
						onEdit={path => {
							delTabs(path as string);
						}}
						tabBarExtraContent={{
							right: !isMobile && <MoreButton delTabs={delTabs} />
						}}
						renderTabBar={(tabBarProps, DefaultTabBar) => (
							<DefaultTabBar {...tabBarProps}>
								{node => (
									<DraggableTabNode {...(node as React.ReactElement).props} key={node.key}>
										{node}
									</DraggableTabNode>
								)}
							</DefaultTabBar>
						)}
					/>
				</SortableContext>
			</DndContext>
		);
	}
};

export default LayoutTabs;
